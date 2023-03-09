// 印章模板title
export const sealTemplateTitle = [
  // {
  //   slot: "selection",
  // },
  {
    label: "模板名称",
    prop: "name",
  },
  {
    label: "中部展示形式",
    prop: "type",
  },
  {
    label: "印章形状",
    prop: "shape",
  },
  {
    label: "印章大小",
    prop: "sealSize",
  },
  {
    label: "证书类型",
    prop: "certType",
  },
  {
    slot: "createTime",
  },
  {
    slot: "option",
  },
];

// 应用授权
export const appAuthorTitle = [
  // {
  //   slot: "selection",
  // },
  {
    label: "应用名称",
    prop: "name",
  },
  {
    label: "IP地址",
    prop: "ip",
  },
  {
    slot: "timecon",
  },
  {
    slot: "createTime",
  },
  {
    slot: "option",
  },
];

// 应用授权子弹框的title
export const appAuthorSonDiaTitle = [
  {
    slot: "selection",
  },
  {
    label: "印章名称",
    prop: "sealName",
  },
  {
    label: "印章编码",
    prop: "sealCode",
  },
  {
    slot: "sealType",
  },
  {
    label: "有效期",
    prop: "expireTime",
  },
];

// 印章管理
export const sealManageTitle = [
  // {
  //   slot: "selection",
  // },
  {
    label: "印章名称",
    prop: "name",
  },
  {
    label: "印章编码",
    prop: "code",
  },
  {
    label: "关联证书",
    prop: "cert",
  },
  {
    label: "生成方式",
    prop: "type",
  },
  {
    slot: "timeBetween",
  },
  {
    slot: "status",
  },
  {
    slot: "createTime",
  },
  {
    slot: "sealImg",
  },
  {
    slot: "option",
  },
];
