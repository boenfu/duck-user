import {MobileDeviceIdentifier} from '@duck-user/core';

import {getUserIdentifier} from './identifier';

export interface DockerUserOptions {
  server: string;
  token?: string;
}

export class DockerUser {
  private identifier!: MobileDeviceIdentifier;

  constructor(private options: DockerUserOptions) {
    this.identifier = getUserIdentifier();
  }

  async set(): Promise<void> {}

  async get(): Promise<void> {}
}
