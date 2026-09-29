// Compatibility shim for Bun runtime with BSON / Mongoose
if (typeof process !== 'undefined' && process.getBuiltinModule) {
  const orig = process.getBuiltinModule;
  process.getBuiltinModule = function (m) {
    if (m === 'v8') {
      const v8 = orig.call(process, 'v8') || {};
      return {
        ...v8,
        startupSnapshot: {
          isBuildingSnapshot: () => false,
          addDeserializeCallback: () => {},
        },
      };
    }
    return orig.call(process, m);
  };
}
