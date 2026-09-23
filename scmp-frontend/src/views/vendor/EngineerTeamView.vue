<template>
  <div class="space-y-5 pb-10 max-w-5xl mx-auto">
    <!-- Header Banner -->
    <div class="card-modern p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 text-white">
      <div>
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            团队资质维护
          </span>
          <h1 class="text-lg md:text-xl font-bold text-white">工程师团队与资质证书档案库</h1>
        </div>
        <p class="text-xs text-emerald-200/80 mt-1">
          维护本服务商团队名册并上传特种作业证书；<strong>证书到期将导致工程师无法被 PM 选派接单，请及时维护续期凭证</strong>。
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="openAddEngModal"
          class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
        >
          <span>👥</span> 录入新工程师
        </button>
      </div>
    </div>

    <!-- Engineers List with Embedded Certs -->
    <div class="space-y-4">
      <div 
        v-for="eng in myEngineers" 
        :key="eng.id" 
        class="card-modern p-5 border border-slate-200/90 space-y-4 hover:border-slate-300 transition-all"
      >
        <!-- Top Bar -->
        <div class="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-slate-100 gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-sm flex items-center justify-center shadow-xs">
              {{ eng.name.slice(0, 1) }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-900 text-sm md:text-base">{{ eng.name }}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">在册在职</span>
              </div>
              <div class="text-xs text-slate-400 font-mono mt-0.5">联系电话: {{ eng.phone }}</div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button 
              @click="openUploadCertModal(eng)" 
              class="px-3.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition-all flex items-center gap-1"
            >
              <span>+</span> 补充/续期特种证书
            </button>
          </div>
        </div>

        <!-- Skills Tags -->
        <div class="text-xs text-slate-600 flex flex-wrap items-center gap-1.5">
          <span class="text-slate-400 font-medium">技能作业方向：</span>
          <span 
            v-for="tag in eng.skillTags.split(',')" 
            :key="tag" 
            class="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs"
          >
            {{ tag.trim() }}
          </span>
        </div>

        <!-- Embedded Certificates Archive -->
        <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs">
          <div class="flex justify-between items-center font-bold text-slate-800">
            <span class="flex items-center gap-1.5">
              <span>📜</span> 已持有特种资质证书档案 (时效性强校验)：
            </span>
            <span class="text-[11px] text-slate-400 font-normal">系统按派单时点自动匹配</span>
          </div>

          <div class="divide-y divide-slate-200/70 bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div 
              v-for="cert in eng.certs" 
              :key="cert.id" 
              class="p-3 flex flex-col sm:flex-row justify-between sm:items-center gap-2"
            >
              <div class="space-y-0.5">
                <div class="font-semibold text-slate-900 flex items-center gap-2">
                  <span>{{ cert.certName }}</span>
                  <span class="font-mono text-slate-500 text-[11px]">(证号: {{ cert.certNo }})</span>
                </div>
                <div class="text-[11px] text-slate-400 font-mono">
                  发证日期: {{ cert.issueDate }} | 
                  <span :class="cert.expireDate >= todayStr ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold'">
                    失效日期: {{ cert.expireDate }} {{ cert.expireDate >= todayStr ? '(正常有效)' : '(已过期失效)' }}
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-2.5 shrink-0">
                <span 
                  class="px-2 py-0.5 rounded text-[10px] font-bold"
                  :class="cert.verifyStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : cert.verifyStatus === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'"
                >
                  {{ cert.verifyStatus === 'VERIFIED' ? '✓ 内部已核验' : cert.verifyStatus === 'PENDING' ? '⏳ 待内部核验' : '✕ 核验驳回' }}
                </span>
                <el-image 
                  :src="cert.certFileUrl" 
                  :preview-src-list="[cert.certFileUrl]" 
                  class="w-8 h-8 rounded border object-cover cursor-pointer hover:opacity-80" 
                />
              </div>
            </div>

            <div v-if="eng.certs.length === 0" class="p-4 text-center text-slate-400 text-xs">
              尚未上传任何资质证书，将无法通过项目准入匹配进行派单
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload/Renew Cert Dialog -->
    <el-dialog v-model="certModalVisible" title="上传/续期工程师资质证书" width="460px">
      <div v-if="selectedEngineer" class="space-y-4 text-xs">
        <div class="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 leading-relaxed">
          <strong>时效性规则：</strong> 上传后初始为【待核验】状态，经内部管理/质安人员在后台查验真实性后方可生效参与派单匹配。
        </div>

        <div class="p-3 bg-slate-50 rounded-xl space-y-1">
          <div>持证工程师：<strong class="text-slate-900">{{ selectedEngineer.name }}</strong> ({{ selectedEngineer.phone }})</div>
        </div>

        <div>
          <label class="block font-bold text-slate-800 mb-1.5">证书资质类型 <span class="text-red-500">*</span></label>
          <el-select v-model="certForm.certTypeId" class="w-full" size="large">
            <el-option 
              v-for="ct in store.certTypes" 
              :key="ct.id" 
              :label="ct.certName" 
              :value="ct.id" 
            />
          </el-select>
        </div>

        <div>
          <label class="block font-bold text-slate-800 mb-1.5">证书编号 / 技能准操证号 <span class="text-red-500">*</span></label>
          <el-input v-model="certForm.certNo" placeholder="如：440301199201015678" size="large" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-800 mb-1.5">发证生效日 <span class="text-red-500">*</span></label>
            <el-date-picker v-model="certForm.issueDate" type="date" value-format="YYYY-MM-DD" class="w-full" size="large" />
          </div>
          <div>
            <label class="block font-bold text-slate-800 mb-1.5">到期失效日 (时效性核心) <span class="text-red-500">*</span></label>
            <el-date-picker v-model="certForm.expireDate" type="date" value-format="YYYY-MM-DD" class="w-full" size="large" />
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-800 mb-1.5">证书扫描件原件 <span class="text-red-500">*</span></label>
          <div class="p-2.5 bg-slate-50 border rounded-lg flex items-center gap-3">
            <el-image :src="certForm.certFileUrl" class="w-12 h-12 rounded border object-cover" />
            <div class="text-[11px] text-slate-400">已选择证书正本扫描件</div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="certModalVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmUploadCert">确认提交核验</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useScmpStore, type Engineer } from '@/store/scmpStore'
import { ElMessage } from 'element-plus'

const store = useScmpStore()
const todayStr = new Date().toISOString().slice(0, 10)

const certModalVisible = ref(false)
const selectedEngineer = ref<Engineer | null>(null)

const certForm = reactive({
  certTypeId: 1,
  certNo: '440301199201019999',
  issueDate: '2024-06-01',
  expireDate: '2027-06-01',
  certFileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400'
})

const myEngineers = computed(() => {
  return store.engineers.filter(e => e.vendorId === (store.currentUser.vendorId || 1))
})

function openUploadCertModal(eng: Engineer) {
  selectedEngineer.value = eng
  certModalVisible.value = true
}

function confirmUploadCert() {
  if (!selectedEngineer.value) return
  if (!certForm.certNo || !certForm.expireDate) {
    ElMessage.warning('请填写完整的证书编号与有效期！')
    return
  }

  const ct = store.certTypes.find(c => c.id === certForm.certTypeId)

  selectedEngineer.value.certs.push({
    id: Date.now(),
    engineerId: selectedEngineer.value.id,
    certTypeId: certForm.certTypeId,
    certName: ct?.certName || '特种证书',
    certNo: certForm.certNo,
    issueDate: certForm.issueDate,
    expireDate: certForm.expireDate,
    certFileUrl: certForm.certFileUrl,
    verifyStatus: 'PENDING'
  })

  ElMessage.success('证书已提交上传！状态为【待内部核验】，请等待内部管理人员核验通过！')
  certModalVisible.value = false
}

function openAddEngModal() {
  ElMessage.info('录入新工程师姓名与手机号后，系统将自动开通工程师协同端账号并短信通知！')
}
</script>
