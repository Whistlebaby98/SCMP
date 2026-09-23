<template>
  <div class="space-y-5 pb-10">
    <!-- Header Banner -->
    <div class="card-modern p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gradient-to-r from-white via-blue-50/20 to-indigo-50/30">
      <div>
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-100 text-brand-700">
            预算红线
          </span>
          <h1 class="text-lg md:text-xl font-bold text-slate-900">项目与委外预算全景管理</h1>
        </div>
        <p class="text-xs text-slate-500 mt-1">
          项目委外总预算为绝对硬上限红线，派单与在途调价严禁超出剩余可用额度；支持立项扩容追加流程。
        </p>
      </div>

      <div class="flex items-center gap-3">
        <el-button type="primary" size="default" @click="openAddProjectModal" class="shadow-sm shadow-brand-500/20">
          <el-icon class="mr-1"><Plus /></el-icon> 新建委外立项
        </el-button>
      </div>
    </div>

    <!-- Budget Overview Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="card-modern p-4 bg-gradient-to-br from-white to-blue-50/30">
        <div class="text-xs text-slate-500 font-medium">项目委外规划总预算</div>
        <div class="text-2xl font-black text-slate-900 font-mono mt-1">¥ {{ totalBudgetSum.toLocaleString() }}</div>
        <div class="text-[11px] text-slate-400 mt-1">已纳入系统管控的项目总盘子</div>
      </div>

      <div class="card-modern p-4 bg-gradient-to-br from-white to-indigo-50/30">
        <div class="text-xs text-slate-500 font-medium">当前已派单占用额度</div>
        <div class="text-2xl font-black text-indigo-600 font-mono mt-1">¥ {{ usedBudgetSum.toLocaleString() }}</div>
        <div class="text-[11px] text-slate-400 mt-1">整体预算占用率: {{ overallPercent }}%</div>
      </div>

      <div class="card-modern p-4 bg-gradient-to-br from-white to-emerald-50/30">
        <div class="text-xs text-emerald-800 font-medium">整体剩余可用派单额度</div>
        <div class="text-2xl font-black text-emerald-600 font-mono mt-1">¥ {{ remainingBudgetSum.toLocaleString() }}</div>
        <div class="text-[11px] text-emerald-700 mt-1">资金池充裕，可继续合规派发新工单</div>
      </div>
    </div>

    <!-- Desktop Table View (Hidden on mobile) -->
    <div class="hidden md:block card-modern overflow-hidden">
      <el-table :data="store.projects" stripe style="width: 100%">
        <el-table-column prop="projectCode" label="项目编号" width="140">
          <template #default="{ row }">
            <span class="font-mono font-bold text-brand-600">{{ row.projectCode }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="projectName" label="项目全称与客户" min-width="220">
          <template #default="{ row }">
            <div class="font-semibold text-slate-800">{{ row.projectName }}</div>
            <div class="text-xs text-slate-400 mt-0.5">客户: {{ row.customerName }} | PM: {{ row.pmName }}</div>
          </template>
        </el-table-column>

        <el-table-column label="准入资质证书门槛" min-width="220">
          <template #default="{ row }">
            <div class="flex flex-wrap gap-1.5 items-center">
              <span 
                v-for="certId in row.requiredCertIds" 
                :key="certId" 
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs"
              >
                <span>📜</span> {{ getCertName(certId) }}
              </span>
              <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                {{ row.certMatchRule === 'AND' ? '需全部持有(AND)' : '满足其一即可(OR)' }}
              </span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="总预算 / 已占用" width="180">
          <template #default="{ row }">
            <div class="text-xs space-y-0.5">
              <div>总额: <strong class="text-slate-900 font-mono font-bold">¥{{ row.totalBudget.toLocaleString() }}</strong></div>
              <div class="text-slate-400">已派: ¥{{ row.usedBudget.toLocaleString() }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="预算余量与占用进度" width="170">
          <template #default="{ row }">
            <div class="text-xs space-y-1">
              <div class="flex justify-between items-center">
                <span class="font-bold text-emerald-600 font-mono">
                  ¥{{ (row.totalBudget - row.usedBudget).toLocaleString() }}
                </span>
                <span class="text-[10px] text-slate-400 font-mono">
                  {{ Number(((row.usedBudget / row.totalBudget) * 100).toFixed(0)) }}%
                </span>
              </div>
              <el-progress 
                :percentage="Number(((row.usedBudget / row.totalBudget) * 100).toFixed(0))" 
                :show-text="false"
                :stroke-width="5"
                :color="row.usedBudget / row.totalBudget > 0.85 ? '#ef4444' : '#10b981'"
              />
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="项目状态" width="110">
          <template #default="{ row }">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              {{ row.status === 'EXECUTING' ? '履约执行中' : '已结项' }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="190" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="openBudgetModal(row)">
              追加预算扩容
            </el-button>
            <el-button size="small" type="success" link @click="goToDispatch(row.id)">
              派发新工单
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Mobile Responsive Cards List (Shown only on mobile) -->
    <div class="block md:hidden space-y-3">
      <div 
        v-for="row in store.projects" 
        :key="row.id" 
        class="card-modern p-4 space-y-3"
      >
        <div class="flex justify-between items-start">
          <div>
            <span class="font-mono text-xs font-bold text-brand-600">{{ row.projectCode }}</span>
            <h3 class="font-bold text-sm text-slate-900 mt-0.5">{{ row.projectName }}</h3>
            <div class="text-xs text-slate-400">客户: {{ row.customerName }} | PM: {{ row.pmName }}</div>
          </div>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
            {{ row.status === 'EXECUTING' ? '执行中' : '已结项' }}
          </span>
        </div>

        <!-- Cert Requirements -->
        <div class="p-2.5 rounded-lg bg-amber-50/50 border border-amber-200/60 text-xs space-y-1">
          <div class="text-[11px] text-amber-800 font-semibold flex items-center justify-between">
            <span>准入证书资质门槛：</span>
            <span>{{ row.certMatchRule === 'AND' ? '需全部持有(AND)' : '满足其一即可(OR)' }}</span>
          </div>
          <div class="flex flex-wrap gap-1">
            <span 
              v-for="certId in row.requiredCertIds" 
              :key="certId" 
              class="px-2 py-0.5 rounded bg-white border border-amber-200 text-[11px] text-amber-900"
            >
              📜 {{ getCertName(certId) }}
            </span>
          </div>
        </div>

        <!-- Budget Progress -->
        <div class="space-y-1 pt-1">
          <div class="flex justify-between text-xs">
            <span class="text-slate-500">剩余可用派单额度:</span>
            <strong class="font-mono text-emerald-600 font-bold text-sm">
              ¥{{ (row.totalBudget - row.usedBudget).toLocaleString() }}
            </strong>
          </div>
          <div class="flex justify-between text-[11px] text-slate-400">
            <span>总预算: ¥{{ row.totalBudget.toLocaleString() }}</span>
            <span>已派占用: ¥{{ row.usedBudget.toLocaleString() }}</span>
          </div>
          <el-progress 
            :percentage="Number(((row.usedBudget / row.totalBudget) * 100).toFixed(0))" 
            :show-text="false"
            :stroke-width="6"
            :color="row.usedBudget / row.totalBudget > 0.85 ? '#ef4444' : '#10b981'"
          />
        </div>

        <!-- Actions -->
        <div class="flex gap-2 pt-2 border-t border-slate-100 justify-end">
          <button 
            @click="openBudgetModal(row)" 
            class="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 border border-brand-200 text-xs font-semibold"
          >
            追加预算
          </button>
          <button 
            @click="goToDispatch(row.id)" 
            class="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold shadow-xs"
          >
            派发新工单
          </button>
        </div>
      </div>
    </div>

    <!-- Budget Expansion Dialog -->
    <el-dialog v-model="budgetModalVisible" title="项目委外预算追加扩容流程" width="460px">
      <div v-if="selectedProject" class="space-y-4 text-xs">
        <div class="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 leading-relaxed">
          <strong>业务红线：</strong> 工单派单金额严格受制于项目总预算。若需提升派单额度，必须先行完成项目立项总预算追加扩容审批。
        </div>

        <div class="p-3.5 bg-slate-50 rounded-xl space-y-1.5">
          <div>项目名称: <strong class="text-slate-900">{{ selectedProject.projectName }}</strong></div>
          <div class="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
            <div>当前总预算: <strong>¥{{ selectedProject.totalBudget.toLocaleString() }}</strong></div>
            <div>已派单占用: <strong class="text-slate-600">¥{{ selectedProject.usedBudget.toLocaleString() }}</strong></div>
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-800 mb-1.5">追加扩容预算金额 (元) <span class="text-red-500">*</span></label>
          <el-input-number v-model="addBudgetAmount" :min="1000" :step="5000" class="w-full" size="large" />
        </div>

        <!-- Projected New Total -->
        <div class="p-3 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 text-xs space-y-1">
          <div class="font-bold flex items-center gap-1">
            <span>✓</span> 扩容后预算模拟预览：
          </div>
          <div class="flex justify-between">
            <span>调整后项目总预算:</span>
            <strong class="font-mono text-emerald-700">¥{{ (selectedProject.totalBudget + addBudgetAmount).toLocaleString() }}</strong>
          </div>
          <div class="flex justify-between">
            <span>调整后可用派单余额:</span>
            <strong class="font-mono text-emerald-700">¥{{ (selectedProject.totalBudget + addBudgetAmount - selectedProject.usedBudget).toLocaleString() }}</strong>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="budgetModalVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAddBudget">确认追加扩容</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useScmpStore, type Project } from '@/store/scmpStore'
import { ElMessage } from 'element-plus'

const store = useScmpStore()
const router = useRouter()

const budgetModalVisible = ref(false)
const selectedProject = ref<Project | null>(null)
const addBudgetAmount = ref(20000)

const totalBudgetSum = computed(() => store.projects.reduce((sum, p) => sum + p.totalBudget, 0))
const usedBudgetSum = computed(() => store.projects.reduce((sum, p) => sum + p.usedBudget, 0))
const remainingBudgetSum = computed(() => totalBudgetSum.value - usedBudgetSum.value)
const overallPercent = computed(() => 
  totalBudgetSum.value > 0 ? Math.round((usedBudgetSum.value / totalBudgetSum.value) * 100) : 0
)

function getCertName(id: number) {
  return store.certTypes.find(c => c.id === id)?.certName || `证书ID:${id}`
}

function openBudgetModal(proj: Project) {
  selectedProject.value = proj
  addBudgetAmount.value = 20000
  budgetModalVisible.value = true
}

function confirmAddBudget() {
  if (selectedProject.value) {
    selectedProject.value.totalBudget += addBudgetAmount.value
    ElMessage.success(`项目【${selectedProject.value.projectName}】总预算已成功追加 ¥${addBudgetAmount.value.toLocaleString()} 元！`)
    budgetModalVisible.value = false
  }
}

function goToDispatch(projectId: number) {
  router.push({ path: '/internal/dispatch/create', query: { projectId: String(projectId) } })
}

function openAddProjectModal() {
  ElMessage.info('可接入立项 ERP 审批流进行批量立项同步')
}
</script>
