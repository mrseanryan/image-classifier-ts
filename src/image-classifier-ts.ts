// To ensure dependencies are included, without adding them to 'dependencies' which bloats the package, install:

// note: cannot export from sharp + rollup chokes on it (C++ ?)
// - resolved by making sharp external

// note: error importing from @google-cloud/vision
// - NOT resolved by making it external
// export * from "./DirectoryProcessor";

// TODO xxx remove
// tslint:disable-next-line:no-unnecessary-class
export default class DummyClass {}
