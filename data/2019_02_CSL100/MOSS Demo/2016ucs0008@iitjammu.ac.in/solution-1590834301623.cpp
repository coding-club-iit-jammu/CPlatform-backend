#include <iostream>
#include <vector>
#include <string>
using namespace std;

vector<int> reconstruct(const vector<string>& arr) {
  int n = arr.size();
  int minDiff = 0, maxDiff = 0;
  
  vector<int> res(n);
  res[0] = 0;
  for (int idx = 1; idx < n; ++idx) {
    if (arr[idx] == "+") {
      res[idx] = maxDiff + 1;
      maxDiff += 1;
    } else if (arr[idx] == "-") {
      res[idx] = minDiff - 1;
      minDiff -= 1;
    }
  }
  // add abs(minDiff) to the result
  for (int idx = 0; idx < n; ++idx) {
    res[idx] += abs(minDiff);
  }
  return res;
}

void solve() {
    int n;
    cin >> n;
    string s;
    vector<string> query;
    query.push_back("None");
    for (int i = 0; i < n; ++i) {
        cin >> s;
        query.push_back(s);
    }
    vector<int> res = reconstruct(query);
    for (auto x: res) {
        cout << x << " ";
    }
    cout << endl;
}
int main() {
  
  int t;
  cin >> t;
  for (int i = 0; i < t; ++i) {
      solve();
  }
  return 0;
}