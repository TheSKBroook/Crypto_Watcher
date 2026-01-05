const fakeDatabase = {
  users: [
    {
      id: 1,
      name: 'User1',
      coins: {
        bitcoin: {
          lastDirection: 'up',
          lastLevel: 50000,
          lastNotification: 1704412800000
        },
        eth: {
          lastDirection: 'down',
          lastLevel: 3000,
          lastNotification: 1704412800000
        }
      }
    },
    {
      id: 2,
      name: 'User2',
      coins: {
        bitcoin: {
          lastDirection: 'up',
          lastLevel: 45000,
          lastNotification: 1704412800000
        },
        eth: {
          lastDirection: 'up',
          lastLevel: 2500,
          lastNotification: 1704412800000
        }
      }
    }
  ]
};

export default fakeDatabase;
