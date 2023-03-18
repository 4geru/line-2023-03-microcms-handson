import { Staff } from './useStaff'
export interface Reservation {
  id: string;
  userName: string;
  lineId: string;
  staff: any;
  course: number;
  reservationAt: Date;
  clientFreeForm: string;
  staffFreeForm: string;
}

export const createReservation = (microcmsClient, reservation: Reservation, staff: Staff, success = () => {}) => {
  if(!confirm("予約しますか？"))return;
  // 「予約作成」のコードを追加する
  return reservation;
}

export const getReservations = async (microcmsClient, filters: string, success: () => {}) => {
  // 「予約一覧」のコードを追加する
  return [];
}

export const updateReservation = (microcmsClient, reservation: Reservation, success = () => {}) => {
  // 「予約メモの更新」のコードを追加する
  return reservation;
}

export const deleteReservation = (microcmsClient, reservation: Reservation, success: () => {}) => {
  if(!confirm("予約を解除しますか？"))return;
  // 「予約削除」のコードを追加する
  return reservation;
}
