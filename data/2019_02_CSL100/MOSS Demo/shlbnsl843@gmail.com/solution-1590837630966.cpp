/**
 * Problem Statement:
 *  The sequence [0, 1, ..., N] has been jumbled, and the only clue you have
    for its order is an array representing whether each number is larger or 
    smaller than the last. Given this information, reconstruct an array that 
    is consistent with it. For example, given [None, +, +, -, +], you could 
    return [1, 2, 3, 0, 4].
 */

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

/**
 * Thinking Notes:
 *  [None] => [0]
    [None, +] => [0, 1]
    [None, -] => [1, 0]

    [None, +, +, +] => [0, 1, 2, 3]
    [None, -, -, -] => [3, 2, 1, 0]

    [None, +, +, -, +] => [x, x+1, x+2, x-2, x-1]
                    x=2 [2, 3, 4, 0, 1]


    [None, -, -, -, +, +, -]
    [x, x-1, x-2, x-3, x+1, x+2, x-4]
    x = 4 [4, 3, 2, 1, 5, 6, 0]

    // relative to x (FIRST ELEMENT)
    maxDiff = 0,
    minDiff = -4

    [0, -1, -2, -3, 1, 2, -4]
    [4, 3, 2, 1, 5, 6, 0]
 */