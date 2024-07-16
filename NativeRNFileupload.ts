import type { TurboModule } from "react-native/Libraries/TurboModule/RCTExport";
import { TurboModuleRegistry } from "react-native";

export interface Spec extends TurboModule {
    upload(options: Object, callback: (err: string, result: string)=>void): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>("RNFileupload"); 