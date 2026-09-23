<template>
  <div class="space-y-5 max-w-5xl mx-auto pb-10">
    <!-- Header Banner -->
    <div class="card-modern p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gradient-to-r from-white via-indigo-50/30 to-blue-50/20">
      <div>
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-100 text-brand-700">
            派单管理
          </span>
          <h1 class="text-lg md:text-xl font-bold text-slate-900">发起项目派单 (强制双选 + 资质强核验)</h1>
        </div>
        <p class="text-xs text-slate-500 mt-1">
          服务商必选、工程师必选；系统按【派单时点有效原则】严格过滤未过期持证人员，并受项目委外预算硬上限红线约束。
        </p>
      </div>
      <el-button size="small" @click="$router.push('/internal/work-orders')">
        <el-icon class="mr-1"><Back /></el-icon> 返回工单列表
      </el-button>
    </div>

    <!-- Main Dispatch Card -->
    <div class="card-modern p-5 md:p-7 space-y-6">
      <el-form :model="form" label-position="top" class="space-y-6">
        <!-- Step 1: Project Selection & Live Budget Meter -->
        <div class="border-b border-slate-100 pb-6 space-y-4">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center">1</span>
            <h3 class="text-sm font-bold text-slate-900">选定所属项目与预算核算</h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <el-form-item label="所属委外项目 (必选)" required class="mb-0">
              <el-select v-model="form.projectId" placeholder="请选择项目" class="w-full" size="large" @change="onProjectChange">
                <el-option
                  v-for="p in store.activeProjects"
                  :key="p.id"
                  :label="`${p.projectCode} - ${p.projectName}`"
                  :value="p.id"
                />
              </el-select>
            </el-form-item>

            <!-- Dynamic Live Budget & Rule Card -->
            <div v-if="currentProject" class="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
              <div class="flex justify-between items-center text-xs">
                <span class="text-slate-500 font-medium">项目委外预算盘子：</span>
                <span class="font-mono text-slate-700">总计: ¥{{ currentProject.totalBudget.toLocaleString() }}</span>
              </div>

              <!-- Budget Bar -->
              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span class="text-slate-600">剩余可用预算：</span>
                  <strong class="font-mono text-emerald-600 text-sm font-bold">
                    ¥{{ (currentProject.totalBudget - currentProject.usedBudget).toLocaleString() }}
                  </strong>
                </div>
                <el-progress 
                  :percentage="budgetUsedPercent" 
                  :stroke-width="8" 
                  :color="budgetUsedPercent > 85 ? '#ef4444' : '#3b82f6'" 
                  :show-text="false" 
                />
                <div class="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>已占用: ¥{{ currentProject.usedBudget.toLocaleString() }} ({{ budgetUsedPercent }}%)</span>
                  <span>派单上限: ¥{{ maxAllowedAmount.toLocaleString() }}</span>
                </div>
              </div>

              <!-- Required Certificates Badges -->
              <div class="pt-2 border-t border-slate-200/80">
                <div class="text-[11px] text-slate-500 mb-1.5 flex items-center gap-1">
                  <span>本项目准入证书要求：</span>
                  <span class="px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">
                    {{ currentProject.certMatchRule === 'AND' ? '需全部持有(AND)' : '任一持有即可(OR)' }}
                  </span>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <span 
                    v-for="cid in currentProject.requiredCertIds" 
                    :key="cid" 
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium"
                  >
                    <span>📜</span> {{ getCertName(cid) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Vendor and Qualified Engineer Selection -->
        <div class="border-b border-slate-100 pb-6 space-y-4">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center">2</span>
            <h3 class="text-sm font-bold text-slate-900">选择服务商与合规工程师 (强核验拦截)</h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <el-form-item label="合作服务商 (必选)" required class="mb-0">
              <el-select v-model="form.vendorId" placeholder="选择服务商企业" class="w-full" size="large" @change="onVendorChange">
                <el-option
                  v-for="v in store.vendors"
                  :key="v.id"
                  :label="`${v.vendorName} (${v.liaisonName})`"
                  :value="v.id"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="履约实施工程师 (必选且资质达标)" required class="mb-0">
              <el-select 
                v-model="form.engineerId" 
                placeholder="请选择达标工程师" 
                class="w-full" 
                size="large" 
                :disabled="!form.vendorId"
              >
                <el-option
                  v-for="eng in availableEngineers"
                  :key="eng.id"
                  :label="`${eng.name} (${eng.qualification.qualified ? '✓ 资质合格' : '✕ ' + eng.qualification.reason})`"
                  :value="eng.id"
                  :disabled="!eng.qualification.qualified"
                >
                  <div class="flex justify-between items-center py-1">
                    <span class="font-medium text-slate-800">{{ eng.name }} ({{ eng.phone }})</span>
                    <span v-if="eng.qualification.qualified" class="text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded">
                      ✓ 证书核验达标
                    </span>
                    <span v-else class="text-red-500 text-xs bg-red-50 px-2 py-0.5 rounded">
                      ✕ {{ eng.qualification.reason }}
                    </span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </div>

          <!-- Selected Engineer's Verified Credentials Snapshot Preview -->
          <div v-if="selectedEngineer" class="p-4 rounded-xl bg-indigo-50/40 border border-indigo-100 text-xs space-y-2">
            <div class="flex justify-between items-center">
              <div class="font-bold text-indigo-950 flex items-center gap-1.5">
                <span>🛡️</span> 选定工程师【{{ selectedEngineer.name }}】持证档案核验（派单留痕快照）：
              </div>
              <span class="text-emerald-600 font-bold text-xs">通过准入审核</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div 
                v-for="c in selectedEngineer.certs" 
                :key="c.id" 
                class="p-2.5 rounded-lg bg-white border border-slate-200 flex justify-between items-center"
              >
                <div>
                  <div class="font-semibold text-slate-800">{{ c.certName }}</div>
                  <div class="text-[11px] text-slate-400 font-mono">证书编号: {{ c.certNo }}</div>
                </div>
                <div class="text-right">
                  <span 
                    class="px-2 py-0.5 rounded text-[10px] font-bold"
                    :class="c.expireDate >= todayStr ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'"
                  >
                    {{ c.expireDate >= todayStr ? `有效至 ${c.expireDate}` : `已过期` }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Work Content & Contract Amount -->
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center">3</span>
            <h3 class="text-sm font-bold text-slate-900">活计内容、施工时限与包干金额</h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <el-form-item label="派单标题 (干什么活)" required class="mb-0">
              <el-input v-model="form.title" placeholder="如：核心机房主配线架光纤熔接与测试" size="large" />
            </el-form-item>

            <el-form-item label="派单包干金额 (元)" required class="mb-0">
              <div class="w-full">
                <el-input-number 
                  v-model="form.amount" 
                  :min="100" 
                  :step="500" 
                  :max="maxAllowedAmount" 
                  class="w-full" 
                  size="large"
                />
                <div class="flex justify-between items-center text-[11px] text-slate-400 mt-1.5">
                  <span>项目预算硬上限: ¥{{ maxAllowedAmount.toLocaleString() }}</span>
                  <span :class="form.amount > maxAllowedAmount ? 'text-red-500 font-bold' : 'text-emerald-600'">
                    {{ form.amount > maxAllowedAmount ? '⚠️ 超出预算不可派单' : '✓ 额度充裕合规' }}
                  </span>
                </div>
              </div>
            </el-form-item>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <el-form-item label="要求完工截止时限" required class="mb-0">
              <el-date-picker 
                v-model="form.deadline" 
                type="datetime" 
                placeholder="选择完工时限" 
                value-format="YYYY-MM-DD HH:mm"
                class="w-full" 
                size="large"
              />
            </el-form-item>
          </div>

          <el-form-item label="详细活计内容与交付验收技术规范" required>
            <el-input 
              v-model="form.workContent" 
              type="textarea" 
              rows="4" 
              placeholder="详细描述施工规范、照片拍摄要求、业主签字单等验收要求..." 
            />
          </el-form-item>
        </div>

        <!-- Action Bar -->
        <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-slate-100">
          <el-button size="large" @click="$router.push('/internal/work-orders')">取消并返回</el-button>
          <el-button 
            type="primary" 
            size="large" 
            :loading="submitting" 
            :disabled="form.amount > maxAllowedAmount || !form.engineerId"
            @click="handleSubmit"
            class="px-8 shadow-md shadow-brand-500/20"
          >
            <el-icon class="mr-1"><Check /></el-icon> 提交派单审核
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useScmpStore } from '@/store/scmpStore'
import { ElMessage } from 'element-plus'

const store = useScmpStore()
const route = useRoute()
const router = useRouter()

const todayStr = new Date().toISOString().slice(0, 10)
const submitting = ref(false)

const form = reactive({
  projectId: 1,
  vendorId: 1,
  engineerId: 1,
  title: '机房核心区128口万兆光纤跳线熔接与OTDR衰减测试',
  workContent: '要求光纤熔接损耗低于0.2dB，每条光纤配线做好激光打标标签，出具完整的OTDR测试报告，且完工必须获得业主工程师现场签字确认单。',
  amount: 3800,
  deadline: '2026-10-15 18:00'
})

onMounted(() => {
  if (route.query.projectId) {
    form.projectId = Number(route.query.projectId)
  }
})

const currentProject = computed(() => store.projects.find(p => p.id === form.projectId))

const maxAllowedAmount = computed(() => {
  if (!currentProject.value) return 0
  return currentProject.value.totalBudget - currentProject.value.usedBudget
})

const budgetUsedPercent = computed(() => {
  if (!currentProject.value) return 0
  return Math.min(100, Math.round((currentProject.value.usedBudget / currentProject.value.totalBudget) * 100))
})

const availableEngineers = computed(() => {
  if (!form.vendorId) return []
  return store.engineers
    .filter(e => e.vendorId === form.vendorId && e.status === 1)
    .map(e => ({
      ...e,
      qualification: store.checkEngineerQualified(form.projectId, e.id)
    }))
})

const selectedEngineer = computed(() => store.engineers.find(e => e.id === form.engineerId))

function getCertName(id: number) {
  return store.certTypes.find(c => c.id === id)?.certName || `证书ID:${id}`
}

function onProjectChange() {
  form.engineerId = undefined as any
}

function onVendorChange() {
  form.engineerId = undefined as any
}

function handleSubmit() {
  if (!form.projectId || !form.vendorId || !form.engineerId) {
    ElMessage.warning('请完整选择所属项目、服务商以及持证工程师！')
    return
  }

  if (!form.title || !form.amount || !form.deadline) {
    ElMessage.warning('请填写完整的工单标题、金额与工期！')
    return
  }

  if (form.amount > maxAllowedAmount.value) {
    ElMessage.error(`派单金额超出项目可用预算硬上限 (¥${maxAllowedAmount.value.toLocaleString()})！请降低金额或先申请追加项目总预算。`)
    return
  }

  try {
    submitting.value = true
    const newOrder = store.dispatchWorkOrder({
      projectId: form.projectId,
      vendorId: form.vendorId,
      engineerId: form.engineerId,
      title: form.title,
      workContent: form.workContent,
      amount: form.amount,
      deadline: form.deadline
    })
    ElMessage.success(`派单成功！单号: ${newOrder.orderNo}，状态变更为【待派单审核】，冻结项目预算 ¥${form.amount}。`)
    router.push('/internal/work-orders')
  } catch (err: any) {
    ElMessage.error(err.message || '派单失败')
  } finally {
    submitting.value = false
  }
}
</script>
