export type SubsystemStatus = 'PASS' | 'WARN' | 'FAIL';

export type SubsystemKey = 'filesystem' | 'crypto' | 'eventLoop' | 'network';

export interface SubsystemResult {
  status: SubsystemStatus;
  latencyMs: number;
  details: string;
}

export interface GlobalPackage {
  name: string;
  version: string;
}

export interface NodeRuntimeInfo {
  version: string;
  arch: string;
  platform: string;
  isAppleSilicon: boolean;
  execPath: string;
  versions: NodeJS.ProcessVersions;
  globalPackages: GlobalPackage[];
}

export interface MemoryInfo {
  totalMB: number;
  freeMB: number;
  usedMB: number;
  processRssMB: number;
}

export interface SystemResourceInfo {
  hostname: string;
  type: string;
  release: string;
  cpuModel: string;
  cpuCores: number;
  memory: MemoryInfo;
  uptimeHours: string;
}

export interface EnvInfo {
  nodeEnv: string;
  hasDotEnv: boolean;
  totalEnvVars: number;
}

export type SubsystemTests = Record<SubsystemKey, SubsystemResult>;

export interface DiagnosticReport {
  timestamp: string;
  durationMs: number;
  allEssentialPassed: boolean;
  node: NodeRuntimeInfo;
  system: SystemResourceInfo;
  environment: EnvInfo;
  tests: SubsystemTests;
}
