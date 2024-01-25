import moment from "moment-timezone";

moment.locale("zh-cn");
moment.tz.setDefault("Asia/Shanghai");

export const formatTime = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();

  return (
    [year, month, day].map(formatNumber).join("/") +
    " " +
    [hour, minute].map(formatNumber).join(":")
  );
};

export const parseTime = (date: Date) => {
  if ((new Date() as any) - (date as any) < 6 * 60 * 60 * 60 * 60) {
    return (
      Math.ceil(((new Date() as any) - (date as any)) / 60 / 60 / 60 / 60) +
      "小时前"
    );
  }
  return formatTime(date);
};
const formatNumber = (n: number) => {
  const s = n.toString();
  return s[1] ? s : "0" + s;
};

export default moment;
