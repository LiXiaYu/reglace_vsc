#pragma once
auto __varg_make(auto& ...__varg_ps)
{
    return [&](auto ...i) {
        static_assert(sizeof...(i) == 0 || sizeof...(i) == 1, "__varg() parameters error");
        auto __varg_il = { __varg_ps... };
        if constexpr (sizeof...(i) == 0) {
            return __varg_il.size();
        }
        else {
            auto i_il = { i... };
            return __varg_il.begin()[i_il.begin()[0]];
        }
    };
}