import { faker } from '@faker-js/faker/locale/ja';
import { createDummyWorkday } from './useWorkdays';

export interface Staff {
  staffName: string;
  photo: string;
  workdays: {}[];
}

export const createRandomStaff = (): Staff => {
  const workdays = createDummyWorkday([]);
  const staff = {
    staffName: `${faker.name.lastName()} ${faker.name.firstName()} `,
    photo: faker.image.avatar(),
    workdays: workdays
  };

  return staff;
}

export const createStaff = (microcmsClient, successCallback, staff) => {
  microcmsClient.create({
    endpoint: 'staffs',
    content: staff,
  })
  .then(successCallback)
  .catch((err) => console.error(err));

  return staff;
}

// workshop: deleteStaff を追加しましょう
export const deleteUser = (microcmsClient, successCallback, staff) => {
  // コードを追加しましょう！
  return staff;
}
