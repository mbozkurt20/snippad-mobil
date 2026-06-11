const {
  withXcodeProject,
  withEntitlementsPlist,
  withDangerousMod,
} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const EXTENSION_NAME = 'KlavyemKeyboard';
const APP_GROUP = 'group.com.klavyem.shared';
const EXTENSION_SOURCES_DIR = path.resolve(
  __dirname,
  '../../Klavyem/ios/KlavyemKeyboard'
);
const NATIVE_MODULE_SOURCES_DIR = path.resolve(__dirname, './ios-sources');

// Copy extension source files + native module files
const withExtensionFiles = (config) =>
  withDangerousMod(config, [
    'ios',
    async (config) => {
      const iosRoot = config.modRequest.platformProjectRoot;

      // Extension folder
      const extDir = path.join(iosRoot, EXTENSION_NAME);
      if (!fs.existsSync(extDir)) fs.mkdirSync(extDir, { recursive: true });
      for (const file of ['KeyboardViewController.swift', 'Info.plist']) {
        fs.copyFileSync(
          path.join(EXTENSION_SOURCES_DIR, file),
          path.join(extDir, file)
        );
      }
      // Extension entitlements
      fs.writeFileSync(
        path.join(extDir, `${EXTENSION_NAME}.entitlements`),
        `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.security.application-groups</key>
  <array>
    <string>${APP_GROUP}</string>
  </array>
</dict>
</plist>
`
      );

      // Copy native module (SharedPrefs) into main app target folder
      // Convention: main app source files live in ios/<projectName>/
      const projectName = config.modRequest.projectName;
      const mainAppDir = path.join(iosRoot, projectName);
      if (!fs.existsSync(mainAppDir)) fs.mkdirSync(mainAppDir, { recursive: true });
      for (const file of ['SharedPrefsModule.swift', 'SharedPrefsModule.m']) {
        const src = path.join(NATIVE_MODULE_SOURCES_DIR, file);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, path.join(mainAppDir, file));
        }
      }

      return config;
    },
  ]);

// Add extension target + native module source files to Xcode project
const withExtensionTarget = (config) =>
  withXcodeProject(config, (config) => {
    const xcodeProject = config.modResults;
    const mainBundleId =
      config.ios?.bundleIdentifier ?? 'com.vertexforge.typekit';
    const extBundleId = `${mainBundleId}.keyboard`;
    const projectName = config.modRequest.projectName;

    // Add native module source files to main app target
    const mainTarget = xcodeProject.getFirstTarget().firstTarget;
    for (const file of ['SharedPrefsModule.swift', 'SharedPrefsModule.m']) {
      const already = xcodeProject
        .pbxSourcesBuildPhaseObj(mainTarget.uuid)
        ?.files?.some((f) => {
          const k = xcodeProject.pbxFileReferenceSection()[f.value];
          return k && k.path && k.path.includes(file);
        });
      if (!already) {
        xcodeProject.addSourceFile(
          `${projectName}/${file}`,
          { target: mainTarget.uuid },
          projectName
        );
      }
    }

    // Skip extension if already added
    const targets = xcodeProject.pbxNativeTargetSection();
    const alreadyAdded = Object.values(targets).some(
      (t) => t && typeof t === 'object' && t.name === EXTENSION_NAME
    );
    if (alreadyAdded) return config;

    const { uuid: targetUuid } = xcodeProject.addTarget(
      EXTENSION_NAME,
      'app_extension',
      EXTENSION_NAME,
      extBundleId
    );

    xcodeProject.addSourceFile(
      `${EXTENSION_NAME}/KeyboardViewController.swift`,
      { target: targetUuid },
      EXTENSION_NAME
    );

    // Build settings for extension
    const configListKey =
      xcodeProject.pbxNativeTargetSection()[targetUuid].buildConfigurationList;
    const configList =
      xcodeProject.pbxXCConfigurationListSection()[configListKey];
    configList.buildConfigurations.forEach(({ value: cfgUuid }) => {
      const cfg = xcodeProject.pbxXCBuildConfigurationSection()[cfgUuid];
      if (!cfg) return;
      cfg.buildSettings.SWIFT_VERSION = '5.0';
      cfg.buildSettings.IPHONEOS_DEPLOYMENT_TARGET = '16.0';
      cfg.buildSettings.PRODUCT_BUNDLE_IDENTIFIER = `"${extBundleId}"`;
      cfg.buildSettings.PRODUCT_NAME = `"${EXTENSION_NAME}"`;
      cfg.buildSettings.CODE_SIGN_ENTITLEMENTS = `"${EXTENSION_NAME}/${EXTENSION_NAME}.entitlements"`;
      cfg.buildSettings.SKIP_INSTALL = 'YES';
      cfg.buildSettings.TARGETED_DEVICE_FAMILY = '"1,2"';
    });

    // Embed App Extensions copy-files phase (dstSubfolderSpec 13 = PlugIns)
    xcodeProject.addBuildPhase(
      [],
      'PBXCopyFilesBuildPhase',
      'Embed App Extensions',
      mainTarget.uuid,
      '',
      'plugins'
    );

    const appexFileRef = xcodeProject.addFile(
      `${EXTENSION_NAME}.appex`,
      xcodeProject.findPBXGroupKey({ name: 'Products' }),
      { lastKnownFileType: '"wrapper.app-extension"', target: mainTarget.uuid }
    );
    xcodeProject.addToPbxCopyfilesBuildPhase(appexFileRef);

    xcodeProject.addTargetDependency(mainTarget.uuid, [targetUuid]);

    return config;
  });

// Ensure App Group entitlement in main app
const withMainAppGroup = (config) =>
  withEntitlementsPlist(config, (config) => {
    const ent = config.modResults;
    const groups = ent['com.apple.security.application-groups'] ?? [];
    if (!groups.includes(APP_GROUP)) {
      ent['com.apple.security.application-groups'] = [...groups, APP_GROUP];
    }
    return config;
  });

module.exports = (config) => {
  config = withExtensionFiles(config);
  config = withExtensionTarget(config);
  config = withMainAppGroup(config);
  return config;
};
