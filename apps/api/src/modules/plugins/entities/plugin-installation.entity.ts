import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Plugin } from './plugin.entity';

@Entity('plugin_installations')
export class PluginInstallation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'plugin_id', type: 'uuid' })
  pluginId: string;

  @ManyToOne(() => Plugin)
  @JoinColumn({ name: 'plugin_id' })
  plugin: Plugin;

  @Column({ name: 'is_enabled', default: true })
  isEnabled: boolean; // Tenant can disable installed plugin

  // Configuration specific to this tenant (e.g., API keys for the plugin service)
  @Column({ type: 'jsonb', nullable: true, select: false })
  config: any;

  @CreateDateColumn({ name: 'installed_at' })
  installedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
