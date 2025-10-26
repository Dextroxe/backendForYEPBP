// src/plugins/redis.ts
import { FastifyInstance } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { Redis } from '@upstash/redis';
// import { v4 } from 'uuid';

declare module 'fastify' {
	interface FastifyRequest {
		redis: Redis;
	}
	interface FastifyInstance {
		redis: Redis;
		UPSTASH_REDIS_REST_URL: string;
      	UPSTASH_REDIS_REST_TOKEN: string;
	}
}

declare module '@upstash/redis' {
	interface Redis {
		remember(
			key: string,
			ttl: number,
			callback: () => string | Promise<string>
		): Promise<string>;
		rememberJSON<T>(
			key: string,
			ttl: number,
			callback: () => T | Promise<void | T>
		): Promise<T>;
		invalidateCaches(...keys: string[]): Promise<void>;
	}
}

export let redis: Redis;

export default fastifyPlugin(
	async (fastify: FastifyInstance) => {
		redis = new Redis({
			url: process.env.UPSTASH_REDIS_REST_URL,
			token:  process.env.UPSTASH_REDIS_REST_TOKEN,
		});

		// Extend with your custom helpers
		redis.remember = async (key, ttl, callback) => {
			let value = await redis.get<string>(key);
			if (value) return value;

			value = await callback();
			await redis.set(key, value, { ex: ttl });
			return value;
		};

		redis.rememberJSON = async (key, ttl, callback) => {
			return JSON.parse(
				await redis.remember(key, ttl, async () =>
					JSON.stringify(await callback())
				)
			);
		};

		redis.invalidateCaches = async (...keys) => {
			await Promise.all(keys.map((key) => redis.del(key)));
		};

		// Decorate Fastify
		fastify.decorate('redis', redis);
		fastify.decorateRequest('redis', {
			getter: () => redis,
		});

		// No need for connect/disconnect hooks (REST API is stateless)
	},
	{ dependencies: ['config'] },
);
