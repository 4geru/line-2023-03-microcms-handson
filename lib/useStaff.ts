import { faker } from '@faker-js/faker/locale/ja';
import { createDummyWorkday } from './useWorkdays';

export interface Staff {
  staffName: string;
  photo: string;
  workdays: {}[];
}

export const createRandomUser = (): Staff => {
  const workdays = createDummyWorkday([]);
  const user = {
    staffName: `${faker.name.lastName()} ${faker.name.firstName()} `,
    photo: faker.image.avatar(),
    workdays: workdays
  };

  return user;
}

export const createUser = (microcmsClient, successCallback, user) => {
  microcmsClient.create({
    endpoint: 'staffs',
    content: user,
  })
  .then(successCallback)
  .catch((err) => console.error(err));

  return user;
}