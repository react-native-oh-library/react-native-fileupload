import type { TurboModule } from "react-native/Libraries/TurboModule/RCTExport";
import { TurboModuleRegistry } from "react-native";

export interface Spec extends TurboModule {
    upload(options: Object): Promise<string>;
}

export default TurboModuleRegistry.getEnforcing<Spec>("RNFileupload"); 