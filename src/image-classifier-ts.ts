// Reference files here, To ensure dependencies are included.
// Else have to add them to 'dependencies' which bloats the package, install size.

// note: cannot export from 'sharp' AND rollup chokes on it (C++ ?)
// - resolved by making sharp external, adding to dependencies

// note: error importing from @google-cloud/vision
// - resolved by making it external
export * from "./DirectoryProcessor";

// To include exifreader, xmldom
export * from "./utils/ExifUtils";

// To include image-size
export * from "./utils/ImageDimensions";

// To include node-fetch
export * from "./geoCode/GeoCoder";

export * from "./utils/args/Args";
export * from "./utils/args/DefaultArgs";

export * from "./utils/output/ConsoleOutputter";
export * from "./utils/output/NullOutputter";
export * from "./utils/output/Verbosity";

// TODO xxx remove
// tslint:disable-next-line:no-unnecessary-class
export default class DummyClass {}
