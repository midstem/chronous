# Vue declaration toolchain

The public adapter declarations are generated against Vue 3.4.0, the minimum
supported peer version. Newer Vue releases add `DefineComponent` type arguments;
emitting those into the package would make its declarations incompatible with
Vue 3.4 consumers even when the JavaScript still works.

This private workspace supplies the declaration types only. Playground runtime,
unit tests and the JavaScript bundle continue to use the root Vue version. The
tarball consumer checks compile and render with both versions.
