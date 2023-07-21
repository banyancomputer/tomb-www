import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

/**
 * AllowedEntity - represents allow-listed alpha users
 * @property id - the pg generated id of the allowed user
 * @property email - the email of the allowed user
 */
@Entity()
export class Allowed {
	@PrimaryGeneratedColumn('uuid')
	id!: number;

	@Column({ type: 'varchar', length: 255, nullable: false })
	email!: string | null;
}
