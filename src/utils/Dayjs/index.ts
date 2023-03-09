import dayjs from "dayjs";
export function formatDate(date: Date | string | number): string {
  if (!date) return "";
  return dayjs(date).format("YYYY-MM-DD");
}

export function formatDateTime(date: Date | string | number): string {
  if (!date) return "";
  //处理000000 为23:59:59
  //new Date(date).getTime() 如果为00:00:00 最后6位格式 23123400000
  if ((new Date(date).getTime() + "").indexOf("00000") > -1) {
    const newDate = new Date(date).getTime() - 1;
    return dayjs(newDate).format("YYYY-MM-DD HH:mm:ss");
  } else {
    return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
  }
}
