export const digital = [
  { name: "Error Reset", reg: 0, bit: 0, type: "pulse" },
  { name: "Process Reset", reg: 0, bit: 1, type: "pulse" },
  { name: "Heartbeat", reg: 1, bit: 0, type: "toggle" },
  { name: "Gun Trigger", reg: 1, bit: 9, type: "toggle" },
  { name: "Mix Mode", reg: 2, bit: 0, type: "toggle" },
  { name: "Color Change Req", reg: 2, bit: 1, type: "pulse" },
  { name: "E-Stat Enable", reg: 3, bit: 0, type: "toggle" },
  { name: "E-Stat Err Reset", reg: 3, bit: 1, type: "pulse" },
  { name: "E-Stat Remote En", reg: 3, bit: 2, type: "toggle" },
  { name: "Robot Reset", reg: 42, bit: 0, type: "pulse" },
  { name: "Start Robot Cycle", reg: 42, bit: 1, type: "pulse" },
  { name: "Flag1", reg: 42, bit: 2, type: "toggle" },
  { name: "Flag2", reg: 42, bit: 3, type: "toggle" },
  { name: "Flag3", reg: 42, bit: 4, type: "toggle" },
  { name: "Flag8", reg: 42, bit: 5, type: "toggle" }
];

export const analog = [
  { name: "Atomizing Air", reg: 10, min: 0, max: 100 },
  { name: "Fan Air", reg: 11, min: 0, max: 100 },
  { name: "Flow Setpoint", reg: 12, min: 50, max: 1500 },
  { name: "Voltage Setpoint", reg: 13, min: 0, max: 100 },
  { name: "Recipe", reg: 20, min: 0, max: 60 },
  { name: "Robot Speed", reg: 40, min: 50, max: 800 },
  { name: "Robot Program", reg: 41, min: 0, max: 10 },
  { name: "Gun Open Time (ms)", reg: 43, min: 0, max: 1000 }
];

export const reads = [
  { name: "General E-Stop", addr: 200, bit: 0 },
  { name: "Gun Trigger Sts", addr: 201, bit: 0 },
  { name: "Safe to Move", addr: 203, bit: 0 },
  { name: "E-Stat Error", addr: 203, bit: 1 },
  { name: "PLC Step", addr: 210, bit: null },
  { name: "Error 0", addr: 211, bit: null },
  { name: "Error 1", addr: 212, bit: null },
  { name: "Error 2", addr: 213, bit: null },
  { name: "Error 3", addr: 214, bit: null },
  { name: "Error 4", addr: 215, bit: null },
  { name: "Atomizing Air FB", addr: 220, bit: null },
  { name: "Fan Air FB", addr: 221, bit: null },
  { name: "2KS Flow SP", addr: 222, bit: null },
  { name: "Voltage FB", addr: 223, bit: null },
  { name: "Recipe Echo", addr: 230, bit: null },
  { name: "Active Recipe", addr: 231, bit: null },
  { name: "Robot At Home", addr: 250, bit: 0 },
  { name: "Robot Cycle Complete", addr: 250, bit: 1 }
];