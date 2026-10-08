CREATE TABLE `roadmaps` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`payload` text NOT NULL,
	`title` text NOT NULL,
	`updated_at` integer NOT NULL
);
