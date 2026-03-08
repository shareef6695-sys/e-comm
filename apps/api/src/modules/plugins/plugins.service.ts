import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plugin } from './entities/plugin.entity';
import { PluginInstallation } from './entities/plugin-installation.entity';

@Injectable()
export class PluginsService {
  constructor(
    @InjectRepository(Plugin)
    private pluginRepository: Repository<Plugin>,
    @InjectRepository(PluginInstallation)
    private installationRepository: Repository<PluginInstallation>,
  ) {}

  async listAvailablePlugins() {
    return this.pluginRepository.find({ where: { isActive: true } });
  }

  async installPlugin(tenantId: string, pluginId: string, config?: any) {
    const plugin = await this.pluginRepository.findOne({ where: { id: pluginId } });
    if (!plugin) throw new NotFoundException('Plugin not found');

    const existing = await this.installationRepository.findOne({
        where: { tenantId, pluginId }
    });

    if (existing) {
        existing.isEnabled = true;
        if (config) existing.config = config;
        return this.installationRepository.save(existing);
    }

    const installation = this.installationRepository.create({
      tenantId,
      pluginId,
      config,
    });
    return this.installationRepository.save(installation);
  }

  async uninstallPlugin(tenantId: string, pluginId: string) {
      const installation = await this.installationRepository.findOne({ where: { tenantId, pluginId } });
      if (!installation) throw new NotFoundException('Plugin not installed');
      
      // Usually we soft delete or just disable
      // For now, let's just disable
      installation.isEnabled = false;
      return this.installationRepository.save(installation);
  }

  async getInstalledPlugins(tenantId: string) {
      return this.installationRepository.find({
          where: { tenantId, isEnabled: true },
          relations: ['plugin']
      });
  }
}
