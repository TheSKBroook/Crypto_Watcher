import { ChangeLevel } from './constants/levels.js';

const fakeDatabase = {
  users: [
    {
      id: 1,
      name: 'User1',
      coins: [
        {
          id : 'bitcoin',
          lastDirection: 'down',
          lastLevel: ChangeLevel.LV2,
          lastNotification: 1767590000000
        },
        {
          id : 'ethereum',
          lastDirection: 'down',
          lastLevel: ChangeLevel.LV1,
          lastNotification: 1767590000000
        }
      ]
    },
    {
      id: 2,
      name: 'User2',
      coins: [
        {
          id : 'bitcoin',
          lastDirection: 'down',
          lastLevel: ChangeLevel.LV2,
          lastNotification: 1767590000000
        },
        {
          id : 'ethereum',
          lastDirection: 'up',
          lastLevel: ChangeLevel.LV1,
          lastNotification: 1767590000000
        }
      ]
    }
  ]
};

export default fakeDatabase;
