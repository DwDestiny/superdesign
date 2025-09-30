import assert from 'assert';
import { buildGlobalCommunicationGuidelines } from '../services/modelProviderUtils';

const text = buildGlobalCommunicationGuidelines();

assert.ok(text.includes('语言镜像原则'), '应包含“语言镜像原则”关键词');
assert.ok(text.includes('永远使用与用户一致的语言沟通'), '应包含“永远使用与用户一致的语言沟通”完整指令');

console.log('✅ language-mirroring tests passed');

