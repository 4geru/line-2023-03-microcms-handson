import { faker } from '@faker-js/faker/locale/ja';

interface User {
    staffName: string;
    photo: string;
    workingDayOfWeek: Number[];
    workingStartAt: Date;
    workingFinishAt: Date;
}

const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
}

const workingDayOfWeek = () => {
  const list = [0, 1, 2, 3, 4, 5, 6]
  list.splice(getRandomInt(7), 1)
  list.splice(getRandomInt(6), 1)
  return list
}

const addHours = (date, h) => {
  var copiedDate = new Date(date.getTime());
  copiedDate.setTime(copiedDate.getTime() + (h*60*60*1000));
  return copiedDate;
}

export function createRandomUser(): User[] {
  const users: User[] = [];
  Array.from({ length: 10 }).forEach(() => {
    // start from 7, 8, 9 or 10 AM
    const workingStartAt = new Date(faker.date.past().setHours(getRandomInt(4) + 7, 0, 0));
    users.push({
      staffName: `${faker.name.lastName()} ${faker.name.firstName()} `,
      photo: faker.image.avatar(),
      workingDayOfWeek: workingDayOfWeek(),
      workingStartAt: workingStartAt,
      workingFinishAt: addHours(workingStartAt, 8),
    });
  });

  return users;
}
