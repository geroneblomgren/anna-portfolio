import * as migration_20260313_220305 from './20260313_220305';
import * as migration_20260313_233801 from './20260313_233801';
import * as migration_20260313_234354 from './20260313_234354';

export const migrations = [
  {
    up: migration_20260313_220305.up,
    down: migration_20260313_220305.down,
    name: '20260313_220305',
  },
  {
    up: migration_20260313_233801.up,
    down: migration_20260313_233801.down,
    name: '20260313_233801',
  },
  {
    up: migration_20260313_234354.up,
    down: migration_20260313_234354.down,
    name: '20260313_234354'
  },
];
