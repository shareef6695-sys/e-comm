import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('plugins')
export class Plugin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string; // e.g., "google-analytics", "mailchimp"

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  version: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean; // Platform-level switch

  // Metadata for the plugin (e.g., required permissions, webhook endpoints)
  @Column({ type: 'jsonb', nullable: true })
  manifest: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
