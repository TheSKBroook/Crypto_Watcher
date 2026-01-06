import { ChangeLevel } from './constants/levels.js';

// I feel like this can just be stored at ram... since this changes a lot
// and losing it on restart is not a big deal.
function initializeFakeCoinDataList() {
  return {
    coins: [
      {
        id: 'bitcoin',
        lastDirection: 'down',
        lastLevel: ChangeLevel.LV2,
        lastNotification: 1767590000000
      },
      {
        id: 'ethereum',
        lastDirection: 'down',
        lastLevel: ChangeLevel.LV1,
        lastNotification: 1767590000000
      }
    ]
  };
}

export let fakeCoinDataList = initializeFakeCoinDataList();

export const fakeWatchList = {
  coins: ['bitcoin', 'ethereum']
}

export const fakeUserDatabase = {
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

export default fakeCoinDataList;
