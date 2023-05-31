import { Injectable } from '@nestjs/common';

@Injectable()
export class PlayersService {
  getPlayers() {
    return [{ name: 'Player One' }, { name: 'Player Two' }];
  }
}
