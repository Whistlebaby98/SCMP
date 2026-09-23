<template>
  <div class="space-y-6 pb-10">
    <!-- Header Banner -->
    <div class="card-modern p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gradient-to-r from-white via-indigo-50/20 to-blue-50/30">
      <div>
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-100 text-brand-700">
            主数据与质资
          </span>
          <h1 class="text-lg md:text-xl font-bold text-slate-900">服务商主数据与资质证书核验中心</h1>
        </div>
        <p class="text-xs text-slate-500 mt-1">
          管控合作服务商准入、企业对公收款账户（资金安全防线）；严审工程师特种作业证书真实性与时效性。
        </p>
      </div>

      <div class="flex items-center gap-3">
        <el-button type="primary" size="default" @click="openAddVendorModal" class="shadow-sm shadow-brand-500/20">
          <el-icon class="mr-1"><Plus /></el-icon> 准入新合作服务商
        </el-button>
      </div>
    </div>

    <!-- 1. Vendors Master List -->
    <div class="card-modern p-5 space-y-4">
      <div class="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-slate-100 gap-2">
        <div>
          <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>🏢</span> 合作服务商名录与对公收款账户 (资金专户强管控)
          </h2>
          <p class="text-[11px] text-slate-400">服务商端禁止任意篡改对公卡号，必须由内部管理员凭盖章公函在后台变更</p>
        </div>
        <span class="text-xs text-slate-500">已签约合作: {{ store.vendors.length }} 家</span>
      </div>

      <!-- Desktop Table (Hidden on mobile) -->
      <div class="hidden md:block overflow-hidden">
        <el-table :data="store.vendors" stripe style="width: 100%">
          <el-table-column prop="vendorCode" label="服务商编码" width="130">
            <template #default="{ row }">
              <span class="font-mono font-bold text-brand-600">{{ row.vendorCode }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="vendorName" label="企业全称与法人" min-width="220">
            <template #default="{ row }">
              <div class="font-semibold text-slate-800">{{ row.vendorName }}</div>
              <div class="text-xs text-slate-400 font-mono mt-0.5">信用代码: {{ row.creditCode }} | 法人: {{ row.legalPerson }}</div>
            </template>
          </el-table-column>

          <el-table-column label="接口负责人 (协同端账号)" width="180">
            <template #default="{ row }">
              <div class="text-xs">
                <div class="font-semibold text-slate-800">{{ row.liaisonName }}</div>
                <div class="text-slate-400 font-mono">{{ row.liaisonPhone }}</div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="对公打款银行账户 (强管控)" min-width="240">
            <template #default="{ row }">
              <div class="text-xs space-y-0.5">
                <div class="text-slate-500">{{ row.bankName }}</div>
                <div class="font-mono font-bold text-slate-900 text-xs">{{ row.bankAccount }}</div>
                <div class="text-[11px] text-slate-400">户名: {{ row.bankAccountName }}</div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="合作状态" width="110">
            <template #default="{ row }">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                {{ row.status === 1 ? '合作正常' : '已暂停' }}
              </span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="140" fixed="right">
            <template #default="{ row }">
              <el-button size="small" type="primary" link @click="openModifyBankModal(row)">
                变更对公账户
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Mobile Vendor Cards (Shown only on mobile) -->
      <div class="block md:hidden space-y-3">
        <div 
          v-for="row in store.vendors" 
          :key="row.id" 
          class="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-2.5 text-xs"
        >
          <div class="flex justify-between items-start">
            <div>
              <span class="font-mono text-xs font-bold text-brand-600">{{ row.vendorCode }}</span>
              <h3 class="font-bold text-sm text-slate-900 mt-0.5">{{ row.vendorName }}</h3>
            </div>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              {{ row.status === 1 ? '合作正常' : '暂停' }}
            </span>
          </div>

          <div class="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1 text-slate-600">
            <div>接口人: <strong class="text-slate-800">{{ row.liaisonName }}</strong> ({{ row.liaisonPhone }})</div>
            <div>开户行: {{ row.bankName }}</div>
            <div>对公卡号: <span class="font-mono text-slate-900 font-bold">{{ row.bankAccount }}</span></div>
          </div>

          <div class="flex justify-end pt-1">
            <button 
              @click="openModifyBankModal(row)" 
              class="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 border border-brand-200 text-xs font-semibold"
            >
              变更对公账户
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Certificate Verification Workbench -->
    <div class="card-modern p-5 space-y-4">
      <div class="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-slate-100 gap-2">
        <div>
          <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>📜</span> 工程师特种资质证书合规核验工作台
          </h2>
          <p class="text-[11px] text-slate-400">服务商上传后需在此核验通过，PM 派单才能匹配该人；证书过期将自动失效拦截</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-500">待核验证书：</span>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white shadow-xs">
            {{ pendingCerts.length }} 本待核验
          </span>
        </div>
      </div>

      <!-- Desktop Table -->
      <div class="hidden md:block overflow-hidden">
        <el-table :data="allCerts" stripe style="width: 100%">
          <el-table-column label="持证工程师 / 服务商" width="200">
            <template #default="{ row }">
              <div class="text-xs">
                <div class="font-bold text-slate-800">{{ getEngineerName(row.engineerId) }}</div>
                <div class="text-slate-400 mt-0.5">{{ getVendorNameByEng(row.engineerId) }}</div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="certName" label="证书资质名称" width="180" />

          <el-table-column prop="certNo" label="证书编号" width="180">
            <template #default="{ row }">
              <span class="font-mono text-xs text-slate-700">{{ row.certNo }}</span>
            </template>
          </el-table-column>

          <el-table-column label="有效期起止 (时效性强校验)" width="200">
            <template #default="{ row }">
              <div class="text-xs font-mono space-y-0.5">
                <div class="text-slate-400">发证: {{ row.issueDate }}</div>
                <div :class="row.expireDate >= todayStr ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold'">
                  失效: {{ row.expireDate }} {{ row.expireDate >= todayStr ? '(正常有效)' : '(已到期)' }}
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="证书扫描件" width="110">
            <template #default="{ row }">
              <el-image 
                :src="row.certFileUrl" 
                :preview-src-list="[row.certFileUrl]" 
                class="w-10 h-10 rounded-lg border object-cover cursor-pointer hover:opacity-80" 
              />
            </template>
          </el-table-column>

          <el-table-column prop="verifyStatus" label="核验状态" width="130">
            <template #default="{ row }">
              <span 
                class="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                :class="row.verifyStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : row.verifyStatus === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'"
              >
                {{ row.verifyStatus === 'VERIFIED' ? '✓ 核验达标' : row.verifyStatus === 'PENDING' ? '⏳ 待内部核验' : '✕ 已驳回' }}
              </span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="160" fixed="right">
            <template #default="{ row }">
              <template v-if="row.verifyStatus === 'PENDING'">
                <el-button size="small" type="success" link @click="verifyCert(row.id, 'VERIFIED')">核验通过</el-button>
                <el-button size="small" type="danger" link @click="verifyCert(row.id, 'REJECTED')">驳回</el-button>
              </template>
              <span v-else class="text-slate-400 text-xs">已核验闭环</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Mobile Cert Cards -->
      <div class="block md:hidden space-y-3">
        <div 
          v-for="row in allCerts" 
          :key="row.id" 
          class="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-2 text-xs"
        >
          <div class="flex justify-between items-start">
            <div>
              <div class="font-bold text-sm text-slate-900">{{ row.certName }}</div>
              <div class="text-slate-500 mt-0.5">持证人: <strong class="text-slate-800">{{ getEngineerName(row.engineerId) }}</strong> ({{ getVendorNameByEng(row.engineerId) }})</div>
            </div>
            <span 
              class="px-2 py-0.5 rounded text-[10px] font-bold"
              :class="row.verifyStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : row.verifyStatus === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'"
            >
              {{ row.verifyStatus === 'VERIFIED' ? '核验通过' : row.verifyStatus === 'PENDING' ? '待核验' : '已驳回' }}
            </span>
          </div>

          <div class="p-2.5 rounded-lg bg-white border border-slate-200 flex justify-between items-center">
            <div>
              <div class="font-mono text-slate-700">编号: {{ row.certNo }}</div>
              <div :class="row.expireDate >= todayStr ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold'" class="text-[11px] font-mono mt-0.5">
                有效期至: {{ row.expireDate }}
              </div>
            </div>
            <el-image 
              :src="row.certFileUrl" 
              :preview-src-list="[row.certFileUrl]" 
              class="w-12 h-12 rounded object-cover border shrink-0" 
            />
          </div>

          <div v-if="row.verifyStatus === 'PENDING'" class="flex justify-end gap-2 pt-1">
            <button 
              @click="verifyCert(row.id, 'REJECTED')" 
              class="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-semibold"
            >
              驳回
            </button>
            <button 
              @click="verifyCert(row.id, 'VERIFIED')" 
              class="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold shadow-xs"
            >
              核验通过
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modify Bank Account Modal -->
    <el-dialog v-model="bankModalVisible" title="变更服务商对公银行账户 (内控最高权限)" width="460px">
      <div v-if="selectedVendor" class="space-y-4 text-xs">
        <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 leading-relaxed">
          <strong>资金安全管控红线：</strong> 服务商严禁在线随意更改卡号，必须凭线下加盖公章的《账户变更公函》由内部管理员后台变更。
        </div>

        <div class="p-3 bg-slate-50 rounded-xl space-y-1">
          <div>服务商企业：<strong class="text-slate-900">{{ selectedVendor.vendorName }}</strong></div>
          <div class="text-slate-400">信用代码: {{ selectedVendor.creditCode }}</div>
        </div>

        <div>
          <label class="block font-bold text-slate-800 mb-1.5">开户银行全称 <span class="text-red-500">*</span></label>
          <el-input v-model="bankForm.bankName" size="large" />
        </div>

        <div>
          <label class="block font-bold text-slate-800 mb-1.5">银行对公账号 <span class="text-red-500">*</span></label>
          <el-input v-model="bankForm.bankAccount" size="large" />
        </div>

        <div>
          <label class="block font-bold text-slate-800 mb-1.5">对公账户户名 <span class="text-red-500">*</span></label>
          <el-input v-model="bankForm.bankAccountName" size="large" />
        </div>
      </div>

      <template #footer>
        <el-button @click="bankModalVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmModifyBank">确认更新对公账户</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useScmpStore, type Vendor } from '@/store/scmpStore'
import { ElMessage } from 'element-plus'

const store = useScmpStore()
const todayStr = new Date().toISOString().slice(0, 10)

const bankModalVisible = ref(false)
const selectedVendor = ref<Vendor | null>(null)
const bankForm = reactive({
  bankName: '',
  bankAccount: '',
  bankAccountName: ''
})

const allCerts = computed(() => {
  return store.engineers.flatMap(e => e.certs)
})

const pendingCerts = computed(() => {
  return allCerts.value.filter(c => c.verifyStatus === 'PENDING')
})

function getEngineerName(engId: number) {
  return store.engineers.find(e => e.id === engId)?.name || `工程师ID:${engId}`
}

function getVendorNameByEng(engId: number) {
  const eng = store.engineers.find(e => e.id === engId)
  if (!eng) return ''
  return store.vendors.find(v => v.id === eng.vendorId)?.vendorName || ''
}

function openModifyBankModal(vendor: Vendor) {
  selectedVendor.value = vendor
  bankForm.bankName = vendor.bankName
  bankForm.bankAccount = vendor.bankAccount
  bankForm.bankAccountName = vendor.bankAccountName
  bankModalVisible.value = true
}

function confirmModifyBank() {
  if (selectedVendor.value) {
    selectedVendor.value.bankName = bankForm.bankName
    selectedVendor.value.bankAccount = bankForm.bankAccount
    selectedVendor.value.bankAccountName = bankForm.bankAccountName
    ElMessage.success(`服务商【${selectedVendor.value.vendorName}】对公银行账户已更新成功！`)
    bankModalVisible.value = false
  }
}

function verifyCert(certId: number, action: 'VERIFIED' | 'REJECTED') {
  store.verifyCertificate(certId, action)
  ElMessage.success(action === 'VERIFIED' ? '证书已核验通过！已生效并进入 PM 派单有效候选库。' : '证书已驳回！')
}

function openAddVendorModal() {
  ElMessage.info('录入新服务商时将自动生成接口负责人账号并短信通知')
}
</script>
