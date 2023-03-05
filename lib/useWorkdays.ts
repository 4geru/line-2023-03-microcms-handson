import { getRandomInt } from './random';

export interface Workday {
  date: Date;
}

export const createDummyWorkday = (workdays) => {
  if(workdays.length !== 0) workdays;
  const today = new Date()
  const randomWorkdays = [1,2,3,4,5,6,7]
    .sort(() => .5 - Math.random())
    .slice(-5)
    .map((v)=> {
      // 8-11 時の間に出社する予定
      const workingStartAt = getRandomInt(3) + 8;
      return {
        fieldId: "workdays",
        workday: new Date(today.getFullYear(), today.getMonth(), today.getDate() + v, workingStartAt).toISOString()
      }
    })
  return randomWorkdays;
}
