import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PluginsService } from './plugins.service';
import { Plugin } from './entities/plugin.entity';
import { PluginInstallation } from './entities/plugin-installation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Plugin, PluginInstallation])],
  providers: [PluginsService],
  exports: [PluginsService],
})
export class PluginsModule {}
