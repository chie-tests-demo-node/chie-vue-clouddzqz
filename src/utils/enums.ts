/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

const testEnum: any = {
  1: "成功",
  2: "失败",
};

/**
操作员
*/
// 印章模板

// 印章类型
export const tempOptions = [
  { label: "法定名称章", value: "1" },
  { label: "业务专用章", value: "2" },
  { label: "财务专用章", value: "3" },
  { label: "合同专用章", value: "4" },
  { label: "印章(方章)", value: "5" },
  { label: "手写签名", value: "6" },
];

export const sealTypeNewEnum = {
  1: '法定名称章',
  2: '业务专用章',
  3: '财务专用章',
  4: '合同专用章',
  5: '印章(方章)',
  6: '手写签名',
}


// 表单规则

// 证书类型
export const certOptions = [
  { label: "个人证书", value: "1" },
  { label: "机构证书", value: "2" },
];

// 印章形状
export const sealShapeOptions = [
  { label: "圆形", value: "1" },
  { label: "椭圆形", value: "0" },
  { label: "方形", value: "2" },
];

// 中部内容展现形式
export const CenterTypeOptions = [
  { label: "文字列", value: "1" },
  { label: "五角星", value: "2" },
  { label: "证书识别号", value: "3" },
];

// 印章管理

// 新增印章表单参数
export const AddNewForm = {
  certType: "",
  timeBetween: "",
  sealType: "",
  successType: "auto",
  lang: "",
  short: "",
};

// 印章生成方式
export const sealCreateTypeEnum = {
  '1': "自动",
  '2': '手动'
}


//角色类型
export const roleTypeEnum = {
  1: '管理员',
  2: '操作员',
  3: '审计员'
}

//操作菜单
export const menuTypeEnum = {
  1: '用户管理',
  2: '信任域管理',
  3: '证书管理',
  4: '印章模板',
  5: '印章管理',
  6: '应用授权',
  7: '业务日志',
  8: '盖章日志',
  9: '印章日志'
}

//操作类型
export const optTypeEnum = {
  1: '新增',
  2: '修改',
  3: '删除'
}

//操作结果
export const optRstEnum = {
  1: '成功',
  2: '失败'
}

//证书类型
export const certTypeEnum = {
  1: '机构证书',
  2: '个人证书'
}

//证书申请方式
export const certApplyTypeEnum = {
  1: '在线',
  2: '离线',
  3: 'PFX'
}

//证书状态
export const certStatusEnum = {
  1: '未导入',
  2: '正常'
}

//密钥算法类型
export const secretAlgTypeEnum = {
  1: 'RSA2048',
  2: "SM2"
}

/**
 * 枚举转select选择对象
 * @param e 
 * @returns 
 */
export const getSelectOption = (e: any) => {
  var rst = [];
  for (var key in e) {
    rst.push({ label: e[key], value: key });
  }
  return rst;
}

// 应用授权

// 印章类型
export const sealModalTypeOptions = [
  { label: "机构", value: "org" },
  { label: "个人", value: "person" },
];

export const sealTypeEnum = {
  '1': '个人',
  '2': '机构',
}
