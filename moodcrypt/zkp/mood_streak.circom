// MoodCrypt ZKP: Prove at least 3 posting days in a week without revealing which days or moods.
// Private inputs: d[0..6] where each d[i] ∈ {0,1} indicates a post occurred that day.
// Public output: valid ∈ {0,1} which is 1 iff sum(d) >= 3

pragma circom 2.1.6;

template Sum7() {
    signal input d0;
    signal input d1;
    signal input d2;
    signal input d3;
    signal input d4;
    signal input d5;
    signal input d6;
    signal output s;

    component add01 = Add();
    component add23 = Add();
    component add45 = Add();
    component add6s = Add();
    component addabc = Add();

    add01.in[0] <== d0;
    add01.in[1] <== d1;
    add23.in[0] <== d2;
    add23.in[1] <== d3;
    add45.in[0] <== d4;
    add45.in[1] <== d5;
    add6s.in[0] <== add45.out;
    add6s.in[1] <== d6;
    addabc.in[0] <== add01.out + add23.out;
    addabc.in[1] <== add6s.out;
    s <== addabc.out;

    // enforce booleans
    d0 * (d0 - 1) === 0;
    d1 * (d1 - 1) === 0;
    d2 * (d2 - 1) === 0;
    d3 * (d3 - 1) === 0;
    d4 * (d4 - 1) === 0;
    d5 * (d5 - 1) === 0;
    d6 * (d6 - 1) === 0;
}

// Returns 1 if x >= 3, else 0
template AtLeast3() {
    signal input x;
    signal output out;
    // out = 1 when x is 3,4,5,6,7
    signal s3;
    signal s4;
    signal s5;
    signal s6;
    signal s7;

    // equality selectors
    s3 <== x == 3;
    s4 <== x == 4;
    s5 <== x == 5;
    s6 <== x == 6;
    s7 <== x == 7;
    out <== s3 + s4 + s5 + s6 + s7;
    // enforce boolean
    out * (out - 1) === 0;
}

template MoodStreak() {
    // private inputs
    signal input d0;
    signal input d1;
    signal input d2;
    signal input d3;
    signal input d4;
    signal input d5;
    signal input d6;
    // public output
    signal output valid;

    component sum = Sum7();
    sum.d0 <== d0;
    sum.d1 <== d1;
    sum.d2 <== d2;
    sum.d3 <== d3;
    sum.d4 <== d4;
    sum.d5 <== d5;
    sum.d6 <== d6;

    component cmp = AtLeast3();
    cmp.x <== sum.s;
    valid <== cmp.out;
}

component main = MoodStreak();
