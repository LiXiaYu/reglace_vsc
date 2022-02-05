#include "asteria.mate.h"
auto foo;
// `foo` refers to a "variable" holding `null`.

const auto inc = 42;
// `inc` refers to an "immutable variable" holding an `integer` of `42`.

auto bar = [&]() { return &inc; }; // return by reference
// `bar` refers to an "immutable variable" holding a function.
// `bar()` refers to the same "variable" as `inc`.

auto add( auto x) { return x + inc; }; // return by value
                                 // `add` refers to an "immutable variable" holding a function.
                                 // `add(5)` refers to a "temporary" holding an `integer` of `47`.

auto pargs( auto a, auto  b, auto  ... __varg_ps) {
  auto __varg = __varg_make(__varg_ps...);

  std.io.putf("named argument `a` = $1\n", a);
  std.io.putf("named argument `b` = $1\n", b);

  std.io.putf("variadic argument count = $1\n", __varg());
  for(auto i = 0; i != __varg(); ++i)
    std.io.putf("variadic argument [$1] = $2\n", i, __varg(i));
}