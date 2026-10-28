import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { load } from 'js-yaml';
import type { OpenAPIV3 } from 'openapi-types';

// Xác định đường dẫn tuyệt đối tới file đặc tả openapi.yaml
const yamlPath = resolve(process.cwd(), 'docs/openapi.yaml');

// Nạp và phân tích nội dung YAML thành đối tượng JavaScript
const value: unknown = load(readFileSync(yamlPath, 'utf8'));

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

// Kiểm tra tính hợp lệ cơ bản của cấu trúc OpenAPI 3.0.3
if (
  !isObj(value) ||
  value.openapi !== '3.0.3' ||
  !isObj(value.info) ||
  !isObj(value.paths)
) {
  throw new Error('OpenAPI YAML thiếu cấu trúc bắt buộc (openapi, info hoặc paths)');
}

export const swaggerSpec = value as unknown as OpenAPIV3.Document;
