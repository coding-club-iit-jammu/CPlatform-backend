#include<bits/stdc++.h>
using namespace std;

int sum(int a, int b){
	return a+b;
}

int main () {
    int T;
    cin >> T;

    while (T--) {
        int a, b;
        cin >> a >> b;
        cout << sum(a, b) << endl;
    }
    return 0;
}