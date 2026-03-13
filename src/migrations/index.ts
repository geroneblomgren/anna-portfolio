import * as migration_20260313_220305 from './20260313_220305';

export const migrations = [
  {
    up: migration_20260313_220305.up,
    down: migration_20260313_220305.down,
    name: '20260313_220305'
  },
];
