import { defineStore } from 'pinia'

export interface User {
  id: number
  username: string
  realName: string
  phone: string
  userType: 'INTERNAL' | 'VENDOR'
  roleCode: 'ROLE_ADMIN' | 'ROLE_PM' | 'ROLE_AUDITOR' | 'ROLE_VND_LIAISON' | 'ROLE_ENG'
  vendorId?: number
  vendorName?: string
}

export interface CertType {
  id: number
  certCode: string
  certName: string
  authority: string
}

export interface EngineerCert {
  id: number
  engineerId: number
  certTypeId: number
  certName: string
  certNo: string
  issueDate: string
  expireDate: string
  certFileUrl: string
  verifyStatus: 'PENDING' | 'VERIFIED' | 'REJECTED'
}

export interface Engineer {
  id: number
  vendorId: number
  userId: number
  name: string
  phone: string
  skillTags: string
  status: number // 1: active
  certs: EngineerCert[]
}

export interface Vendor {
  id: number
  vendorName: string
  vendorCode: string
  creditCode: string
  legalPerson: string
  contactPhone: string
  bankName: string
  bankAccount: string
  bankAccountName: string
  liaisonName: string
  liaisonPhone: string
  status: number
}

export interface Project {
  id: number
  projectName: string
  projectCode: string
  customerName: string
  pmId: number
  pmName: string
  totalBudget: number
  usedBudget: number
  requiredCertIds: number[]
  certMatchRule: 'AND' | 'OR'
  status: 'EXECUTING' | 'COMPLETED'
}

export interface Deliverable {
  id: number
  workOrderId: number
  orderNo: string
  projectTitle: string
  batchNo: number
  progressPercent: number
  applyAmount: number
  approvedAmount?: number
  deductionAmount: number
  deductionReason?: string
  summary: string
  signSheetUrl: string
  attachmentUrls: string[]
  auditStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  auditOpinion?: string
  auditTime?: string
  settleStatus: 'UNSETTLED' | 'SETTLING' | 'SETTLED'
  createTime: string
}

export interface WorkOrder {
  id: number
  orderNo: string
  projectId: number
  projectName: string
  vendorId: number
  vendorName: string
  engineerId: number
  engineerName: string
  title: string
  workContent: string
  amount: number
  completedAmount: number
  settledAmount: number
  deadline: string
  status: 'DRAFT' | 'PENDING_DISPATCH_AUDIT' | 'DISPATCH_REJECTED' | 'PENDING_ACCEPTANCE' | 'IN_PROGRESS' | 'REJECTED_BY_VENDOR' | 'ALL_COMPLETED'
  certSnapshot: any
  rejectReason?: string
  acceptedAt?: string
  createBy: number
  createByName: string
  createTime: string
}

export interface Settlement {
  id: number
  settleNo: string
  vendorId: number
  vendorName: string
  applicantName: string
  deliverableIds: number[]
  deliverableCount: number
  totalApprovedAmount: number
  extraExpense: number
  finalSettleAmount: number
  invoiceUrl: string
  bankSnapshot: {
    bankName: string
    bankAccount: string
    bankAccountName: string
  }
  status: 'PENDING_APPROVAL' | 'SETTLE_REJECTED' | 'APPROVED_WAIT_PUSH' | 'EXTERNAL_PROCESSING' | 'PAID' | 'EXTERNAL_FAILED'
  externalBillNo?: string
  paySerialNo?: string
  payTime?: string
  failReason?: string
  createTime: string
}

export const useScmpStore = defineStore('scmp', {
  state: () => {
    // Current Sim User (Default: PM Zhang)
    const currentUser: User = {
      id: 2,
      username: 'pm_zhang',
      realName: '张经理 (项目经理)',
      phone: '13800000001',
      userType: 'INTERNAL',
      roleCode: 'ROLE_PM'
    }

    const certTypes: CertType[] = [
      { id: 1, certCode: 'CERT_ELEC_LOW', certName: '低压电工作业操作证', authority: '应急管理部' },
      { id: 2, certCode: 'CERT_CABLE_MID', certName: '综合布线工程师(中级)', authority: '中国通信工业协会' },
      { id: 3, certCode: 'CERT_SECURITY_SYS', certName: '智能安防系统集成工程师', authority: '公安部第一研究所' },
      { id: 4, certCode: 'CERT_HIGH_ALT', certName: '特种高处作业操作证', authority: '应急管理局' }
    ]

    const vendors: Vendor[] = [
      {
        id: 1,
        vendorName: '深圳华创智能工程有限公司',
        vendorCode: 'VND2026001',
        creditCode: '91440300MA5XXXXXX1',
        legalPerson: '周建国',
        contactPhone: '0755-88889999',
        bankName: '招商银行高新园支行',
        bankAccount: '6214830129481234',
        bankAccountName: '深圳华创智能工程有限公司',
        liaisonName: '周建国 (接口负责人)',
        liaisonPhone: '13800000008',
        status: 1
      },
      {
        id: 2,
        vendorName: '广东恒通网络集成服务部',
        vendorCode: 'VND2026002',
        creditCode: '91440101MA5YYYYYY2',
        legalPerson: '赵恒',
        contactPhone: '020-66667777',
        bankName: '中国建设银行天河支行',
        bankAccount: '6227003810294829',
        bankAccountName: '广东恒通网络集成服务部',
        liaisonName: '赵恒 (接口负责人)',
        liaisonPhone: '13900000009',
        status: 1
      }
    ]

    const engineers: Engineer[] = [
      {
        id: 1,
        vendorId: 1,
        userId: 5,
        name: '陈明',
        phone: '13900000001',
        skillTags: '机房弱电, 光纤跳线熔接, 低压配电',
        status: 1,
        certs: [
          {
            id: 1,
            engineerId: 1,
            certTypeId: 1,
            certName: '低压电工作业操作证',
            certNo: '440301199201015678',
            issueDate: '2024-06-30',
            expireDate: '2027-06-30', // Valid!
            certFileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400',
            verifyStatus: 'VERIFIED'
          }
        ]
      },
      {
        id: 2,
        vendorId: 1,
        userId: 6,
        name: '王立',
        phone: '13900000003',
        skillTags: '弱电线缆, 桥架安装',
        status: 1,
        certs: [
          {
            id: 2,
            engineerId: 2,
            certTypeId: 1,
            certName: '低压电工作业操作证',
            certNo: '440106199505051234',
            issueDate: '2023-08-15',
            expireDate: '2026-08-15', // Expired!
            certFileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400',
            verifyStatus: 'VERIFIED'
          }
        ]
      },
      {
        id: 3,
        vendorId: 2,
        userId: 7,
        name: '刘伟',
        phone: '13900000002',
        skillTags: '安防监控调试, 综合布线',
        status: 1,
        certs: [
          {
            id: 3,
            engineerId: 3,
            certTypeId: 2,
            certName: '综合布线工程师(中级)',
            certNo: '440101199303038899',
            issueDate: '2024-01-10',
            expireDate: '2027-12-31',
            certFileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400',
            verifyStatus: 'VERIFIED'
          }
        ]
      }
    ]

    const projects: Project[] = [
      {
        id: 1,
        projectName: '某科技园区智慧机房改造工程',
        projectCode: 'PRJ-2026-001',
        customerName: '高新园区管委会',
        pmId: 2,
        pmName: '张经理',
        totalBudget: 150000.0,
        usedBudget: 28000.0,
        requiredCertIds: [1], // 需要低压电工证
        certMatchRule: 'AND',
        status: 'EXECUTING'
      },
      {
        id: 2,
        projectName: '市人民医院急诊大楼网络综合布线',
        projectCode: 'PRJ-2026-002',
        customerName: '市第一人民医院',
        pmId: 2,
        pmName: '张经理',
        totalBudget: 80000.0,
        usedBudget: 12500.0,
        requiredCertIds: [2], // 需综合布线中级证
        certMatchRule: 'AND',
        status: 'EXECUTING'
      },
      {
        id: 3,
        projectName: '金融国际中心楼宇安防视频监控升级',
        projectCode: 'PRJ-2026-003',
        customerName: '恒基物业中心',
        pmId: 2,
        pmName: '张经理',
        totalBudget: 120000.0,
        usedBudget: 0.0,
        requiredCertIds: [3],
        certMatchRule: 'OR',
        status: 'EXECUTING'
      }
    ]

    const workOrders: WorkOrder[] = [
      {
        id: 1,
        orderNo: 'WO-20260901-001',
        projectId: 1,
        projectName: '某科技园区智慧机房改造工程',
        vendorId: 1,
        vendorName: '深圳华创智能工程有限公司',
        engineerId: 1,
        engineerName: '陈明',
        title: '核心机房A区6台服务器机柜导轨安装与PDU引接',
        workContent: '负责6台42U服务器机柜就位安装，电源PDU双路引入，张贴标签并出具阻抗测试单。',
        amount: 4500.0,
        completedAmount: 0.0,
        settledAmount: 0.0,
        deadline: '2026-10-10 18:00',
        status: 'PENDING_DISPATCH_AUDIT',
        certSnapshot: { certName: '低压电工作业操作证', certNo: '440301199201015678', expireDate: '2027-06-30' },
        createBy: 2,
        createByName: '张经理',
        createTime: '2026-09-24 09:00'
      },
      {
        id: 2,
        orderNo: 'WO-20260901-002',
        projectId: 1,
        projectName: '某科技园区智慧机房改造工程',
        vendorId: 1,
        vendorName: '深圳华创智能工程有限公司',
        engineerId: 1,
        engineerName: '陈明',
        title: '机房主配线架128口万兆光纤跳线熔接与OTDR测试',
        workContent: '要求光纤损耗低于0.2dB，每条光纤配线做好激光打标，完工需现场工程师签字单。',
        amount: 3800.0,
        completedAmount: 0.0,
        settledAmount: 0.0,
        deadline: '2026-10-15 18:00',
        status: 'PENDING_ACCEPTANCE',
        certSnapshot: { certName: '低压电工作业操作证', certNo: '440301199201015678', expireDate: '2027-06-30' },
        createBy: 2,
        createByName: '张经理',
        createTime: '2026-09-24 10:15'
      },
      {
        id: 3,
        orderNo: 'WO-20260901-003',
        projectId: 2,
        projectName: '市人民医院急诊大楼网络综合布线',
        vendorId: 2,
        vendorName: '广东恒通网络集成服务部',
        engineerId: 3,
        engineerName: '刘伟',
        title: '医院急诊楼1-3层弱电竖井水平桥架敷设及穿线',
        workContent: '急诊通道夜间作业，铺设300mm镀锌桥架，穿放六类非屏蔽双绞线共计48条。',
        amount: 6500.0,
        completedAmount: 0.0,
        settledAmount: 0.0,
        deadline: '2026-10-05 18:00',
        status: 'IN_PROGRESS',
        certSnapshot: { certName: '综合布线工程师(中级)', certNo: '440101199303038899', expireDate: '2027-12-31' },
        acceptedAt: '2026-09-20 09:30',
        createBy: 2,
        createByName: '张经理',
        createTime: '2026-09-19 14:00'
      },
      {
        id: 4,
        orderNo: 'WO-20260901-004',
        projectId: 1,
        projectName: '某科技园区智慧机房改造工程',
        vendorId: 1,
        vendorName: '深圳华创智能工程有限公司',
        engineerId: 1,
        engineerName: '陈明',
        title: '科技园区机房环境温湿度及漏水传感器部署联动调试',
        workContent: '安装8路温湿度传感器及绳式漏水报警器，接入机房动环主机并做联动测试。',
        amount: 10000.0,
        completedAmount: 2800.0,
        settledAmount: 0.0,
        deadline: '2026-09-30 18:00',
        status: 'IN_PROGRESS',
        certSnapshot: { certName: '低压电工作业操作证', certNo: '440301199201015678', expireDate: '2027-06-30' },
        acceptedAt: '2026-09-15 09:00',
        createBy: 2,
        createByName: '张经理',
        createTime: '2026-09-14 11:00'
      },
      {
        id: 5,
        orderNo: 'WO-20260901-005',
        projectId: 2,
        projectName: '市人民医院急诊大楼网络综合布线',
        vendorId: 1,
        vendorName: '深圳华创智能工程有限公司',
        engineerId: 1,
        engineerName: '陈明',
        title: '急诊大厅网络信息插座打底面板安装及测试',
        workContent: '共计64个双口86型网络面板打底，对应配线架端打线，测试100%连通无错线。',
        amount: 8000.0,
        completedAmount: 8000.0,
        settledAmount: 0.0,
        deadline: '2026-09-22 18:00',
        status: 'ALL_COMPLETED',
        certSnapshot: { certName: '低压电工作业操作证', certNo: '440301199201015678', expireDate: '2027-06-30' },
        acceptedAt: '2026-09-12 08:30',
        createBy: 2,
        createByName: '张经理',
        createTime: '2026-09-11 16:00'
      }
    ]

    const deliverables: Deliverable[] = [
      {
        id: 101,
        workOrderId: 4,
        orderNo: 'WO-20260901-004',
        projectTitle: '科技园区机房环境温湿度及漏水传感器部署 (第1批 30%)',
        batchNo: 1,
        progressPercent: 30.0,
        applyAmount: 3000.0,
        approvedAmount: 2800.0,
        deductionAmount: 200.0,
        deductionReason: '现场施工超时1天，按违约扣除200元',
        summary: '机房温湿度传感器已安装4处并联调通过，施工符合规范。',
        signSheetUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
        attachmentUrls: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400'],
        auditStatus: 'APPROVED',
        auditOpinion: '核验通过，扣除超时款后入账2800元待报销池',
        auditTime: '2026-09-22 14:00',
        settleStatus: 'UNSETTLED',
        createTime: '2026-09-21 16:30'
      },
      {
        id: 102,
        workOrderId: 5,
        orderNo: 'WO-20260901-005',
        projectTitle: '急诊大厅网络信息插座打底面板安装 (100% 全单完工)',
        batchNo: 1,
        progressPercent: 100.0,
        applyAmount: 8000.0,
        approvedAmount: 8000.0,
        deductionAmount: 0.0,
        summary: '64个点位全部测试连通无误，业主工程师已在现场验收合格并签字。',
        signSheetUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
        attachmentUrls: ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400'],
        auditStatus: 'APPROVED',
        auditOpinion: '全部合格，同意验收',
        auditTime: '2026-09-23 11:00',
        settleStatus: 'UNSETTLED',
        createTime: '2026-09-22 17:00'
      },
      {
        id: 103,
        workOrderId: 3,
        orderNo: 'WO-20260901-003',
        projectTitle: '医院急诊楼弱电竖井水平桥架敷设 (第1批 50%)',
        batchNo: 1,
        progressPercent: 50.0,
        applyAmount: 3250.0,
        deductionAmount: 0.0,
        summary: '1-2层镀锌桥架敷设完毕，穿放双绞线24条，等待初验。',
        signSheetUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
        attachmentUrls: ['https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400'],
        auditStatus: 'PENDING',
        settleStatus: 'UNSETTLED',
        createTime: '2026-09-24 11:30'
      }
    ]

    const settlements: Settlement[] = [
      {
        id: 1,
        settleNo: 'ST-20260920-001',
        vendorId: 1,
        vendorName: '深圳华创智能工程有限公司',
        applicantName: '周建国 (接口负责人)',
        deliverableIds: [99],
        deliverableCount: 1,
        totalApprovedAmount: 12000.0,
        extraExpense: 0.0,
        finalSettleAmount: 12000.0,
        invoiceUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
        bankSnapshot: {
          bankName: '招商银行高新园支行',
          bankAccount: '6214830129481234',
          bankAccountName: '深圳华创智能工程有限公司'
        },
        status: 'PAID',
        externalBillNo: 'ERP-EXP-20260920-10023',
        paySerialNo: 'CMB202609228812903',
        payTime: '2026-09-22 15:30',
        createTime: '2026-09-20 10:00'
      }
    ]

    return {
      currentUser,
      certTypes,
      vendors,
      engineers,
      projects,
      workOrders,
      deliverables,
      settlements
    }
  },

  getters: {
    // Current Project options
    activeProjects: (state) => state.projects.filter(p => p.status === 'EXECUTING'),
    
    // Check if engineer is qualified for a project
    checkEngineerQualified: (state) => (projectId: number, engineerId: number) => {
      const project = state.projects.find(p => p.id === projectId)
      const engineer = state.engineers.find(e => e.id === engineerId)
      if (!project || !engineer) return { qualified: false, reason: '未找到项目或工程师' }

      if (project.requiredCertIds.length === 0) return { qualified: true }

      const today = new Date().toISOString().slice(0, 10)
      const validCertTypeIds = engineer.certs
        .filter(c => c.verifyStatus === 'VERIFIED' && c.expireDate >= today)
        .map(c => c.certTypeId)

      if (project.certMatchRule === 'AND') {
        const hasAll = project.requiredCertIds.every(id => validCertTypeIds.includes(id))
        if (!hasAll) {
          const missing = project.requiredCertIds
            .filter(id => !validCertTypeIds.includes(id))
            .map(id => state.certTypes.find(ct => ct.id === id)?.certName || `证书ID:${id}`)
            .join('、')
          return { qualified: false, reason: `缺少有效必需证书：${missing}` }
        }
      } else {
        const hasAny = project.requiredCertIds.some(id => validCertTypeIds.includes(id))
        if (!hasAny) {
          return { qualified: false, reason: `必须持有该项目要求资质之一且在有效期内` }
        }
      }

      return { qualified: true }
    },

    // Candidate deliverables ready for Liaison reimbursement
    reimbursableDeliverables: (state) => (vendorId: number) => {
      // Find orders belonging to vendor
      const vendorOrders = state.workOrders.filter(w => w.vendorId === vendorId).map(w => w.id)
      return state.deliverables.filter(d => 
        vendorOrders.includes(d.workOrderId) && 
        d.auditStatus === 'APPROVED' && 
        d.settleStatus === 'UNSETTLED'
      )
    }
  },

  actions: {
    // Switch login user
    switchUser(roleCode: User['roleCode']) {
      switch (roleCode) {
        case 'ROLE_PM':
          this.currentUser = { id: 2, username: 'pm_zhang', realName: '张经理 (项目经理 PM)', phone: '13800000001', userType: 'INTERNAL', roleCode: 'ROLE_PM' }
          break
        case 'ROLE_AUDITOR':
          this.currentUser = { id: 3, username: 'audit_li', realName: '李主管 (审核管理人员)', phone: '13800000002', userType: 'INTERNAL', roleCode: 'ROLE_AUDITOR' }
          break
        case 'ROLE_ADMIN':
          this.currentUser = { id: 1, username: 'admin', realName: '系统管理员', phone: '13800000000', userType: 'INTERNAL', roleCode: 'ROLE_ADMIN' }
          break
        case 'ROLE_VND_LIAISON':
          this.currentUser = { id: 4, username: 'liaison_zhou', realName: '周建国 (服务商接口负责人)', phone: '13800000008', userType: 'VENDOR', roleCode: 'ROLE_VND_LIAISON', vendorId: 1, vendorName: '深圳华创智能工程有限公司' }
          break
        case 'ROLE_ENG':
          this.currentUser = { id: 5, username: 'eng_chen', realName: '陈明 (服务商工程师)', phone: '13900000001', userType: 'VENDOR', roleCode: 'ROLE_ENG', vendorId: 1, vendorName: '深圳华创智能工程有限公司' }
          break
      }
    },

    // 1. PM Dispatch Work Order
    dispatchWorkOrder(payload: {
      projectId: number
      vendorId: number
      engineerId: number
      title: string
      workContent: string
      amount: number
      deadline: string
    }) {
      const project = this.projects.find(p => p.id === payload.projectId)
      if (!project) throw new Error('项目不存在')

      const remainingBudget = project.totalBudget - project.usedBudget
      if (payload.amount > remainingBudget) {
        throw new Error(`派单金额 ¥${payload.amount} 超出项目剩余可用预算 ¥${remainingBudget}`)
      }

      const qual = this.checkEngineerQualified(payload.projectId, payload.engineerId)
      if (!qual.qualified) {
        throw new Error(`工程师资质不满足项目要求: ${qual.reason}`)
      }

      const engineer = this.engineers.find(e => e.id === payload.engineerId)!
      const vendor = this.vendors.find(v => v.id === payload.vendorId)!

      // Freeze budget
      project.usedBudget += payload.amount

      const newOrder: WorkOrder = {
        id: Date.now(),
        orderNo: `WO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
        projectId: payload.projectId,
        projectName: project.projectName,
        vendorId: payload.vendorId,
        vendorName: vendor.vendorName,
        engineerId: payload.engineerId,
        engineerName: engineer.name,
        title: payload.title,
        workContent: payload.workContent,
        amount: payload.amount,
        completedAmount: 0,
        settledAmount: 0,
        deadline: payload.deadline,
        status: 'PENDING_DISPATCH_AUDIT',
        certSnapshot: engineer.certs.map(c => ({ certName: c.certName, certNo: c.certNo, expireDate: c.expireDate })),
        createBy: this.currentUser.id,
        createByName: this.currentUser.realName,
        createTime: new Date().toISOString().slice(0, 16).replace('T', ' ')
      }

      this.workOrders.unshift(newOrder)
      return newOrder
    },

    // 2. Audit Dispatch
    auditDispatch(orderId: number, action: 'APPROVE' | 'REJECT', comment?: string) {
      const order = this.workOrders.find(o => o.id === orderId)
      if (!order) return

      if (action === 'APPROVE') {
        order.status = 'PENDING_ACCEPTANCE'
      } else {
        order.status = 'DISPATCH_REJECTED'
        // Refund frozen budget on reject
        const project = this.projects.find(p => p.id === order.projectId)
        if (project) {
          project.usedBudget = Math.max(0, project.usedBudget - order.amount)
        }
      }
    },

    // 3. PM Withdraw dispatch
    withdrawDispatch(orderId: number) {
      const order = this.workOrders.find(o => o.id === orderId)
      if (!order) return
      if (order.status !== 'PENDING_DISPATCH_AUDIT' && order.status !== 'PENDING_ACCEPTANCE') {
        throw new Error('当前工单状态不允许撤回')
      }
      order.status = 'DRAFT'
      const project = this.projects.find(p => p.id === order.projectId)
      if (project) {
        project.usedBudget = Math.max(0, project.usedBudget - order.amount)
      }
    },

    // 4. Engineer Respond (Accept or Reject)
    respondWorkOrder(orderId: number, action: 'ACCEPT' | 'REJECT', reason?: string) {
      const order = this.workOrders.find(o => o.id === orderId)
      if (!order) return

      if (action === 'ACCEPT') {
        order.status = 'IN_PROGRESS'
        order.acceptedAt = new Date().toISOString().slice(0, 16).replace('T', ' ')
      } else {
        order.status = 'REJECTED_BY_VENDOR'
        order.rejectReason = reason || '无原因说明'
        // Refund budget on refusal
        const project = this.projects.find(p => p.id === order.projectId)
        if (project) {
          project.usedBudget = Math.max(0, project.usedBudget - order.amount)
        }
      }
    },

    // 5. In-flight Amount Modification
    modifyWorkOrderAmount(orderId: number, newAmount: number, reason: string) {
      const order = this.workOrders.find(o => o.id === orderId)
      if (!order) return

      const project = this.projects.find(p => p.id === order.projectId)!
      const diff = newAmount - order.amount

      if (diff > 0) {
        const remaining = project.totalBudget - project.usedBudget
        if (diff > remaining) {
          throw new Error(`追加金额 ¥${diff} 超出项目剩余预算天花板 ¥${remaining}。如需增加请先办理项目总预算扩容！`)
        }
        project.usedBudget += diff
      } else {
        project.usedBudget += diff // minus diff
      }

      order.amount = newAmount
    },

    // 6. Submit Phased Deliverable (Serial control)
    submitPhasedDeliverable(payload: {
      workOrderId: number
      progressPercent: number
      applyAmount: number
      summary: string
      signSheetUrl: string
      attachmentUrls: string[]
    }) {
      const order = this.workOrders.find(o => o.id === payload.workOrderId)
      if (!order) throw new Error('工单不存在')

      // Serial Check: Has pending batch?
      const hasPending = this.deliverables.some(d => d.workOrderId === payload.workOrderId && d.auditStatus === 'PENDING')
      if (hasPending) {
        throw new Error('前一笔完工申请正在审核中，需等待审批完成方可提报下一批完工！')
      }

      const existingBatches = this.deliverables.filter(d => d.workOrderId === payload.workOrderId).length
      const newDeliverable: Deliverable = {
        id: Date.now(),
        workOrderId: payload.workOrderId,
        orderNo: order.orderNo,
        projectTitle: `${order.title} (第${existingBatches + 1}批 ${payload.progressPercent}%)`,
        batchNo: existingBatches + 1,
        progressPercent: payload.progressPercent,
        applyAmount: payload.applyAmount,
        deductionAmount: 0,
        summary: payload.summary,
        signSheetUrl: payload.signSheetUrl,
        attachmentUrls: payload.attachmentUrls,
        auditStatus: 'PENDING',
        settleStatus: 'UNSETTLED',
        createTime: new Date().toISOString().slice(0, 16).replace('T', ' ')
      }

      this.deliverables.unshift(newDeliverable)
      return newDeliverable
    },

    // 7. Audit Phased Deliverable with Direct Deduction (B1)
    auditDeliverable(deliverableId: number, action: 'APPROVED' | 'REJECTED', approvedAmount?: number, deductionAmount?: number, deductionReason?: string, opinion?: string) {
      const deliv = this.deliverables.find(d => d.id === deliverableId)
      if (!deliv) return

      if (action === 'APPROVED') {
        deliv.auditStatus = 'APPROVED'
        deliv.approvedAmount = approvedAmount !== undefined ? approvedAmount : deliv.applyAmount
        deliv.deductionAmount = deductionAmount || 0
        deliv.deductionReason = deductionReason
        deliv.auditOpinion = opinion || '验收合格'
        deliv.auditTime = new Date().toISOString().slice(0, 16).replace('T', ' ')

        // Update WorkOrder accumulated completed amount
        const order = this.workOrders.find(o => o.id === deliv.workOrderId)
        if (order) {
          order.completedAmount += deliv.approvedAmount
          if (deliv.progressPercent >= 100 || order.completedAmount >= order.amount) {
            order.status = 'ALL_COMPLETED'
          }
        }
      } else {
        deliv.auditStatus = 'REJECTED'
        deliv.auditOpinion = opinion || '质量不合格或签字单模糊，驳回整改'
      }
    },

    // 8. Liaison Apply Consolidated Reimbursement (A1)
    applyConsolidatedSettlement(payload: {
      deliverableIds: number[]
      invoiceUrl: string
      extraExpense?: number
    }) {
      const selected = this.deliverables.filter(d => payload.deliverableIds.includes(d.id))
      if (selected.length === 0) throw new Error('请至少勾选一笔已核准完工单')

      const totalApproved = selected.reduce((sum, d) => sum + (d.approvedAmount || d.applyAmount), 0)
      const extra = payload.extraExpense || 0
      const finalSettle = totalApproved + extra

      // Atomic lock settleStatus
      selected.forEach(d => {
        d.settleStatus = 'SETTLING'
      })

      const vendor = this.vendors.find(v => v.id === this.currentUser.vendorId || 1)!

      const newSettle: Settlement = {
        id: Date.now(),
        settleNo: `ST-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
        vendorId: vendor.id,
        vendorName: vendor.vendorName,
        applicantName: this.currentUser.realName,
        deliverableIds: payload.deliverableIds,
        deliverableCount: payload.deliverableIds.length,
        totalApprovedAmount: totalApproved,
        extraExpense: extra,
        finalSettleAmount: finalSettle,
        invoiceUrl: payload.invoiceUrl,
        bankSnapshot: {
          bankName: vendor.bankName,
          bankAccount: vendor.bankAccount,
          bankAccountName: vendor.bankAccountName
        },
        status: 'PENDING_APPROVAL',
        createTime: new Date().toISOString().slice(0, 16).replace('T', ' ')
      }

      this.settlements.unshift(newSettle)
      return newSettle
    },

    // 9. Auditor push settlement to External System
    pushToExternalReimbursement(settlementId: number) {
      const settle = this.settlements.find(s => s.id === settlementId)
      if (!settle) return

      settle.status = 'EXTERNAL_PROCESSING'
      settle.externalBillNo = `ERP-EXP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(10000 + Math.random() * 90000)}`
    },

    // 10. Simulate External Payment Callback
    simulateExternalCallback(settlementId: number, success: boolean, serialNo?: string, failReason?: string) {
      const settle = this.settlements.find(s => s.id === settlementId)
      if (!settle) return

      const linkedDelivs = this.deliverables.filter(d => settle.deliverableIds.includes(d.id))

      if (success) {
        settle.status = 'PAID'
        settle.paySerialNo = serialNo || `CMB${Date.now()}`
        settle.payTime = new Date().toISOString().slice(0, 16).replace('T', ' ')
        // Mark deliverables SETTLED
        linkedDelivs.forEach(d => {
          d.settleStatus = 'SETTLED'
          const order = this.workOrders.find(o => o.id === d.workOrderId)
          if (order) {
            order.settledAmount += (d.approvedAmount || d.applyAmount)
          }
        })
      } else {
        settle.status = 'EXTERNAL_FAILED'
        settle.failReason = failReason || '发票开户行名称不一致或财务审核退回'
        // Unlock deliverables
        linkedDelivs.forEach(d => {
          d.settleStatus = 'UNSETTLED'
        })
      }
    },

    // 11. Manage Engineer Certs
    verifyCertificate(certId: number, action: 'VERIFIED' | 'REJECTED') {
      for (const eng of this.engineers) {
        const cert = eng.certs.find(c => c.id === certId)
        if (cert) {
          cert.verifyStatus = action
          break
        }
      }
    }
  }
})
