#include <iostream>
using namespace std;
int calculatePower(int a, int b);

int main() {
  int t, a, b;
  cin >> t;
  for (int i = 0; i < t; ++i) {
    cin >> a >> b;
    cout << calculatePower(a, b) << endl;
  }
}