import { Column, SnackBarProps } from "../models/index";

export const Status = {
  SUCCESS: "SUCCESS",
  FAIL: "FAIL",
};
export const productStatusTabs = {
  Published: 0,
  Unpublished: 1,
};
export const SaleStatus = {
  ENABLED: "Enabled",
  IDLE: "Idle",
  DISABLED: "Disabled",
};
export const carriers: any = {
  SF: {
    key: "SF",
    label: "顺丰快递",
  },
  DB: {
    key: "DB",
    label: "德邦快递",
  },
  ST: {
    key: "ST",
    label: "申通快递",
  },
  YT: {
    key: "YT",
    label: "圆通速递",
  },
  ZT: {
    key: "ZT",
    label: "中通快递",
  },
  YD: {
    key: "YD",
    label: "韵达快递",
  },
};

export const OrderStatus = {
  UNPAID: "Unpaid",
  PAID: "Paid",
  PENDING: "Pending",
  SHIPPING: "Shipping",
  CANCELLED: "canceled",
};

export const StatusLabel: any = {
  UNPAID: "未付款",
  PAID: "已付款",
  PENDING: "处理中",
  SHIPPING: "已发货",
  CANCELLED: "已取消",
  DENY: "已驳回",
  ALL: "状态",
};
export const navigators = {
  productList: {
    label: "货品管理",
    path: "product",
  },
  order: {
    label: "订单发货",
    path: "order",
  },
  history: {
    label: "历史订单",
    path: "history",
  },
  account: {
    label: "插件",
    path: "account",
  },
  setting: {
    label: "设置",
    path: "setting",
  },
};

export const loggedIn = () => {
  return localStorage.getItem("sessionKey") ? true : false;
};
export const countryCodes = [
  {
    value: "86",
    label: "中国",
    key: "CN",
  },
  {
    value: "1",
    label: "加拿大",
    key: "CA",
  },
  {
    value: "1",
    label: "美国",
    key: "US",
  },
];
export const actions = {
  release: {
    label: "上架",
    key: "RELEASE",
  },
  unrelease: {
    label: "下架",
    key: "UNRELEASE",
  },
  submit: {
    lable: "上传",
    key: "SUBMIT",
  },
  edit: {
    label: "编辑",
    key: "EDIT",
  },
  delete: {
    label: "删除",
    key: "DELETE",
  },
  reject: {
    label: "驳回",
    key: "REJECT",
  },
  ship: {
    label: "确认发货",
    key: "SHIP",
  },
};

export const snackMessage: {
  [key: string]: { [key: string]: SnackBarProps };
} = {
  success: {
    edit: { type: "success", message: "修改成功" },
    submit: { type: "success", message: "提交成功" },
    reject: { type: "success", message: "已驳回订单" },
    send: { type: "success", message: "邮件已发送" },
    signup: { type: "success", message: "注册成功" },
    reset: { type: "success", message: "密码重置成功" },
    copy: { type: "success", message: "已成功复制" },
    verify: { type: "success", message: "验证成功" },
  },
  error: {
    imageOver: { type: "error", message: "最多可上传10张图片" },
    edit: { type: "error", message: "修改失败" },
    sizeOver: { type: "error", message: "单个图片不能超过1MB" },
    submit: { type: "error", message: "提交失败" },
    send: { type: "error", message: "邮件有误" },
    signup: { type: "error", message: "注册失败" },
    verify: { type: "error", message: "验证失败" },
  },
};

export const columns: Column[] = [
  { type: "images", label: "产品图片", align: "center", minWidth: 140 },
  {
    type: "name",
    label: "产品名称",
    align: "center",
    minWidth: 120,
  },
  {
    type: "price",
    label: "价格",
    minWidth: 120,
    align: "center",
  },
];
