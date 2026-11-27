# Repeat baseline (anti-repeat Phase 1)

Measured on main with seed 20261113: 2000 draws per skill x tier (median over 10 trials, cap 300), shapes from 1000 tier-1 draws, 10 replays per lesson, 30 daily days, 50 level rounds. Window K = 5 previous runs. English ids have no `itemForSkill` generator and are skipped (41 ids). Lesson sims use the default renderable filter; the game additionally drops unrenderable keys. Level lists are the base stage lists (stages 1-3). Daily profile: every non-English skill attempted once, boxes spread 1-5, all due on day 0.

## Targets (plan.md): T2 — 40 skill x tier cells below 60 distinct in 2000 draws. Worst lesson seen-in-previous-5: B4 Bảng nhân 2, 5 và bảng chia 2, 5 at 76.7%.

## A. Distinct items + shapes per skill x tier (worst first)

| skill | family | lesson | tier 1 | tier 2 | tier 3 | shapes (t1) |
|---|---|---|---|---|---|---|
| div-tens-mental | arithmetic | T1 B26 | 11 (med 4.5) | 3 (med 3) | 126 (med 16.5) | 1 |
| fraction-read | fraction | T1 B14 | 3 (med 3) | 8 (med 5) | 56 (med 10) | 3 |
| money-recognize | money | T2 B68 | 4 (med 3) | 3 (med 3) | 3 (med 3) | 1 |
| money-exchange | money | T2 B68 | 4 (med 3) | 4 (med 3) | 7 (med 3.5) | 1 |
| mul-hundreds-mental | arithmetic | T1 B36 | 5 (med 3.5) | 9 (med 5) | 126 (med 14.5) | 1 |
| mul-thousands-mental | arithmetic | T2 B56 | 5 (med 3.5) | 11 (med 5) | 158 (med 16.5) | 1 |
| div-hundreds-mental | arithmetic | T1 B37 | 8 (med 5) | 6 (med 4) | 126 (med 16.5) | 1 |
| div-thousands-mental | arithmetic | T2 B57 | 8 (med 5) | 6 (med 4) | 140 (med 19) | 1 |
| fraction-shaded | fraction | T1 B14 | 6 (med 4) | 13 (med 4) | 30 (med 7) | 1 |
| mul-tens-mental | arithmetic | T1 B23 | 6 (med 4) | 8 (med 4) | 126 (med 14.5) | 1 |
| geo-midpoint-length | geometry | T1 B16 | 66 (med 6.5) | 36 (med 8.5) | 9 (med 4) | 1 |
| money-total-notes | money | T2 B68 | 9 (med 3.5) | 125 (med 14) | 238 (med 14) | 1 |
| number-to-roman | number | T2 B47 | 10 (med 4.5) | 10 (med 3.5) | 20 (med 4) | 1 |
| roman-to-number | number | T2 B47 | 10 (med 4.5) | 10 (med 3.5) | 20 (med 4) | 1 |
| roman-clock-hour | time | T2 B47 | 14 (med 5) | 14 (med 5) | 11 (med 4.5) | 1 |
| fraction-of-set-circle | fraction | T1 B14 | 12 (med 5) | 80 (med 10) | 286 (med 21.5) | 1 |
| geo-midpoint | geometry | T1 B16 | 12 (med 4.5) | 12 (med 3.5) | 57 (med 6) | 1 |
| geo-radius-diameter | geometry | T1 B17 | 12 (med 4.5) | 24 (med 6) | 32 (med 8.5) | 1 |
| meas-ml | measurement | T1 B32 | 13 (med 5) | 16 (med 4.5) | 93 (med 9) | 1 |
| meas-area-square | measurement | T2 B52 | 27 (med 7) | 27 (med 8.5) | 14 (med 5) | 3 |
| meas-len-choose-unit | measurement | T1 B7, T1 B30 | 14 (med 4) | 16 (med 6) | 16 (med 6) | 1 |
| meas-perimeter-square | measurement | T2 B50 | 19 (med 5) | 19 (med 5.5) | 19 (med 5.5) | 1 |
| meas-mm-convert | measurement | T1 B30 | 20 (med 6) | 1572 (med 47) | 1712 (med 88.5) | 2 |
| mul-2d-1d | arithmetic | T1 B23 | 40 (med 8.5) | 36 (med 5.5) | 22 (med 8) | 1 |
| clock-read-hour-half | time | T2 B66 | 24 (med 6) | 24 (med 6) | 24 (med 6) | 1 |
| geo-solid-parts | geometry | T1 B21 | 27 (med 6.5) | 1110 (med 56) | 207 (med 13.5) | 3 |
| num-neighbors-1000 | number | T1 B1 | 591 (med 26.5) | 27 (med 5) | 1171 (med 14) | 1 |
| div-2d-1d | arithmetic | T1 B26 | 37 (med 11) | 54 (med 8.5) | 31 (med 7) | 1 |
| fraction-of-set-number | fraction | T1 B14 | 32 (med 6.5) | 152 (med 12) | 665 (med 27) | 1 |
| clock-sang-chieu-24h | time | T2 B66 | 33 (med 10) | 392 (med 22.5) | 1267 (med 62) | 3 |
| meas-area-rect | measurement | T2 B52 | 36 (med 6) | 36 (med 7) | 117 (med 6.5) | 1 |
| meas-ml-calc | measurement | T1 B32 | 45 (med 7) | 40 (med 6.5) | 36 (med 6) | 1 |
| meas-len-convert-far | measurement | T1 B7, T1 B30 | 40 (med 6.5) | 42 (med 6) | 42 (med 6) | 1 |
| months-days-count | time | T2 B66 | 44 (med 10.5) | 47 (med 9) | 45 (med 6.5) | 1 |
| meas-ruler-read | measurement | T1 B7, T1 B30 | 45 (med 11) | 403 (med 31) | 1055 (med 54.5) | 1 |
| chance-dice | data | T2 B74 | 48 (med 5) | 266 (med 15.5) | 1171 (med 51.5) | 1 |
| clock-read-5min | time | T2 B66 | 48 (med 11) | 144 (med 20.5) | 144 (med 20.5) | 1 |
| div-reduce-times | arithmetic | T1 B37 | 48 (med 10) | 1336 (med 70.5) | 801 (med 33.5) | 1 |
| meas-temperature | measurement | T1 B33 | 48 (med 12) | 1998 (med >300) | 296 (med 21) | 1 |
| time-set-clock | time | T2 B66 | 48 (med 8) | 144 (med 12) | 675 (med 26.5) | 2 |
| roman-sequence | number | T2 B47 | 64 (med 12.5) | 64 (med 12.5) | 128 (med 11) | 2 |
| add-sub-mental-round | arithmetic | T1 B2 | 90 (med 6) | 1524 (med 74) | 1769 (med 112) | 1 |
| div-2d-1d-remainder | arithmetic | T1 B26 | 92 (med 9) | 256 (med 16) | 139 (med 22) | 1 |
| geo-right-angle | geometry | T1 B18 | 96 (med 15) | 2000 (med >300) | 1998 (med >300) | 1 |
| meas-len-ladder | measurement | T1 B7, T1 B30 | 610 (med 28) | 114 (med 18) | 114 (med 18) | 1 |
| unknown-mul-div | unknown | T1 B13 | 128 (med 14.5) | 552 (med 24.5) | 1480 (med 71) | 2 |
| clock-read-minute | time | T2 B66 | 144 (med 20.5) | 679 (med 24) | 679 (med 24) | 1 |
| money-change-back | money | T2 B68 | 144 (med 12.5) | 216 (med 20.5) | 428 (med 24) | 1 |
| pattern-skip-count | pattern | T1 B4-B6, B9-B12 | 222 (med 22.5) | 289 (med 26) | 148 (med 18.5) | 1 |
| meas-len-mixed | measurement | T1 B7, T1 B30 | 162 (med 14.5) | 344 (med 15.5) | 344 (med 15.5) | 1 |
| meas-wp-fence | measurement | T2 B50, B53 | 170 (med 16) | 485 (med 23) | 170 (med 18) | 1 |
| mul-3d-1d | arithmetic | T1 B36 | 178 (med 12.5) | 447 (med 26) | 528 (med 50.5) | 1 |
| meas-perimeter-rect | measurement | T2 B50 | 189 (med 15) | 189 (med 18.5) | 189 (med 18.5) | 1 |
| geo-shape-count | geometry | T1 B7, T1 B19 | 195 (med 16) | 393 (med 9) | 543 (med 8) | 2 |
| div-rem-ceil | remainder | T1 B25 | 215 (med 14.5) | 1140 (med 46) | 964 (med 45.5) | 3 |
| money-wp | money | T2 B68 | 216 (med 20) | 1386 (med 74) | 216 (med 19) | 1 |
| div-3d-1d | arithmetic | T1 B37 | 425 (med 28.5) | 593 (med 42.5) | 224 (med 21) | 1 |
| fraction-wp | fraction | T1 B14 | 227 (med 12) | 424 (med 20) | 514 (med 25.5) | 4 |
| geo-count-right-angles | geometry | T1 B18 | 278 (med 12.5) | 1841 (med 118) | 2000 (med >300) | 1 |
| wp-difference-compare | word-problem | T1 B39 | 311 (med 26.5) | 866 (med 23) | 1194 (med 31.5) | 4 |
| wp-times-compare | word-problem | T1 B39 | 311 (med 26.5) | 866 (med 23) | 1194 (med 31.5) | 4 |
| pattern-add | pattern | T1 B8 | 331 (med 19) | 404 (med 27) | 506 (med 27) | 1 |
| pattern-sub | pattern | T1 B8 | 331 (med 19) | 404 (med 27) | 506 (med 27) | 1 |
| calendar-weekday | time | T2 B66 | 336 (med 32) | 1081 (med 50) | 484 (med 32.5) | 1 |
| num-read-write-1000 | number | T1 B1 | 1089 (med 64.5) | 342 (med 24.5) | 446 (med 22.5) | 2 |
| money-pick-notes | money | T2 B68 | 359 (med 14.5) | 1520 (med 50) | 1886 (med 135.5) | 1 |
| div-rem-floor | remainder | T1 B25 | 427 (med 24) | 1473 (med 54) | 1343 (med 83.5) | 1 |
| geo-solid-identify | geometry | T1 B7, T1 B21 | 452 (med 9) | 2000 (med >300) | 2000 (med >300) | 1 |
| meas-gram | measurement | T1 B31 | 532 (med 27) | 1981 (med >300) | 483 (med 31) | 1 |
| mul-3d-1d-wp | arithmetic | T1 B36 | 511 (med 34.5) | 1669 (med 98.5) | 1896 (med 217.5) | 3 |
| clock-elapsed-minutes | time | T2 B66 | 529 (med 25) | 1123 (med 65.5) | 1385 (med 70.5) | 1 |
| meas-len-compare | measurement | T1 B7, T1 B30 | 541 (med 7) | 927 (med 15.5) | 927 (med 15.5) | 1 |
| meas-len-convert | measurement | T1 B7, T1 B30 | 575 (med 25.5) | 577 (med 26) | 577 (med 26) | 1 |
| chance-bag | data | T2 B74 | 755 (med 18) | 604 (med 14) | 1379 (med 19) | 1 |
| num-place-value-1000 | number | T1 B1 | 1363 (med 58.5) | 616 (med 31.5) | 849 (med 33) | 2 |
| tf-explain | logic | T1 B25, B38, B39 | 673 (med 31) | 1211 (med 67) | 1239 (med 52) | 3 |
| wp-divide-then-add | word-problem | T1 B27, B28 | 705 (med 29.5) | 1369 (med 59) | 1582 (med 73.5) | 4 |
| wp-divide-then-sub | word-problem | T1 B27, B28 | 705 (med 29.5) | 1369 (med 59) | 1582 (med 73.5) | 4 |
| mul-4d-1d | arithmetic | T2 B56 | 719 (med 28) | 1432 (med 52) | 1769 (med 119) | 1 |
| mul-2d-1d-wp | arithmetic | T1 B23 | 1071 (med 50.5) | 1022 (med 36.5) | 725 (med 32) | 1 |
| meas-len-add-sub | measurement | T1 B7, T1 B30 | 751 (med 28.5) | 1674 (med 102) | 1344 (med 42.5) | 2 |
| num-sequence-1000 | number | T1 B1 | 807 (med 33.5) | 794 (med 28) | 1222 (med 43) | 1 |
| div-3d-1d-remainder | arithmetic | T1 B37 | 895 (med 45.5) | 1459 (med 84.5) | 844 (med 44) | 1 |
| num-order-1000 | number | T1 B1 | 2000 (med >300) | 862 (med 33.5) | 1610 (med 15) | 4 |
| tally-count | data | T2 B73 | 889 (med 36.5) | 1828 (med 119.5) | 1983 (med >300) | 1 |
| round-which-place | number | T2 B61 | 1046 (med 44) | 1898 (med 185.5) | 1991 (med >300) | 1 |
| fraction-pick-picture | fraction | T1 B14 | 1056 (med 37) | 1959 (med 231) | 1959 (med 231) | 3 |
| meas-gram-calc | measurement | T1 B31 | 1091 (med 44.5) | 1068 (med 31.5) | 1877 (med 168.5) | 1 |
| round-hundreds | number | T2 B48 | 1119 (med 38) | 1189 (med 31) | 1174 (med 37) | 2 |
| round-tens | number | T2 B48 | 1120 (med 67.5) | 1165 (med 44) | 1146 (med 32.5) | 2 |
| mul-div-find-error | arithmetic | T1 B26, T1 B37 | 1186 (med 53.5) | 1858 (med 99.5) | 1748 (med 90) | 2 |
| wp-times-then-add | word-problem | T1 B24, B28 | 1283 (med 39.5) | 1499 (med 68) | 1463 (med 64.5) | 4 |
| mul-div-large-wp | arithmetic | T2 B56, T2 B57, T2 B70, T2 B71 | 1326 (med 44) | 1309 (med 7.5) | 1844 (med 125) | 3 |
| wp-times-then-sub | word-problem | T1 B24, B28 | 1319 (med 47) | 1548 (med 72.5) | 1520 (med 72.5) | 4 |
| unknown-mul-div-wp | unknown | T1 B13 | 1330 (med 76) | 1813 (med 111) | 1924 (med 130) | 4 |
| unknown-add-sub | unknown | T1 B3 | 1377 (med 56.5) | 1871 (med 146.5) | 1780 (med 177.5) | 2 |
| mul-5d-1d | arithmetic | T2 B70 | 1400 (med 22.5) | 1861 (med 121.5) | 1974 (med >300) | 1 |
| div-4d-1d | arithmetic | T2 B57 | 1581 (med 101) | 1700 (med 76.5) | 1476 (med 68) | 1 |
| num-read-write-10000 | number | T2 B45 | 1835 (med 137.5) | 1642 (med 97) | 1533 (med 35.5) | 2 |
| times-order-digital | time | T2 B66 | 1555 (med 81) | 2000 (med >300) | 1946 (med 230.5) | 1 |
| num-order-10000 | number | T2 B46 | 2000 (med >300) | 2000 (med >300) | 1582 (med 12) | 4 |
| div-2d-1d-wp | arithmetic | T1 B26 | 1592 (med 79) | 1889 (med 120) | 1889 (med 120) | 1 |
| num-expand-100000 | number | T2 B59 | 1954 (med >300) | 1598 (med 100) | 1956 (med 252.5) | 1 |
| choose-all-correct | logic | T1 B25, B38, B39 | 1695 (med 56) | 1838 (med 102) | 1826 (med 117.5) | 1 |
| expr-brackets | expression | T1 B38 | 1778 (med 105) | 1717 (med 82.5) | 1886 (med 166.5) | 1 |
| mul-chain-operators | arithmetic | T2 B56, T2 B57, T2 B70, T2 B71 | 1725 (med 57) | 1981 (med >300) | 1980 (med >300) | 1 |
| expr-order | expression | T1 B38 | 1729 (med 97.5) | 1729 (med 119) | 1995 (med >300) | 1 |
| wp-unit-then-times | word-problem | T1 B28 | 1739 (med 86) | 1910 (med 197) | 1917 (med 178) | 4 |
| calendar-days-between | time | T2 B66 | 1765 (med 92.5) | 1846 (med 126) | 1846 (med 126) | 1 |
| geo-circle-parts | geometry | T1 B17 | 1772 (med 114.5) | 1772 (med 114.5) | 1797 (med 117) | 1 |
| num-compare-1000 | number | T1 B1 | 1999 (med >300) | 1974 (med >300) | 1775 (med 122) | 1 |
| num-place-value-10000 | number | T2 B45 | 1895 (med 151.5) | 1780 (med 96.5) | 1783 (med 92.5) | 2 |
| round-thousands | number | T2 B61 | 1873 (med 162) | 1880 (med 201.5) | 1802 (med 38) | 2 |
| div-4d-1d-remainder | arithmetic | T2 B57 | 1821 (med 150.5) | 1931 (med 271.5) | 1866 (med 119.5) | 1 |
| wp-more-less-then-total | word-problem | T1 B28 | 1821 (med 127) | 1945 (med 155) | 1954 (med >300) | 6 |
| expr-from-story | expression | T1 B38, B42 | 1843 (med 106) | 1840 (med 173.5) | 1970 (med 289) | 2 |
| num-read-write-100000 | number | T2 B59 | 1983 (med 259.5) | 1975 (med 264.5) | 1856 (med 41.5) | 2 |
| meas-perimeter-polygon | measurement | T2 B50 | 1871 (med 125) | 1879 (med 184) | 1956 (med >300) | 1 |
| num-order-100000 | number | T2 B60 | 2000 (med >300) | 2000 (med >300) | 1875 (med 138) | 4 |
| round-ten-thousands | number | T2 B61 | 1983 (med >300) | 1985 (med >300) | 1891 (med 38) | 2 |
| unknown-add-sub-wp | unknown | T1 B3 | 1901 (med 234) | 1989 (med >300) | 1983 (med 262.5) | 2 |
| meas-temperature-compare | measurement | T1 B33 | 1940 (med 261) | 2000 (med >300) | 1999 (med >300) | 1 |
| add-sub-1000 | arithmetic | T1 B2 | 1977 (med 243.5) | 1989 (med >300) | 1942 (med 203.5) | 2 |
| add-sub-100000-wp | arithmetic | T2 B63, T2 B64 | 2000 (med >300) | 1944 (med 172) | 2000 (med >300) | 5 |
| div-5d-1d | arithmetic | T2 B71 | 1949 (med 237.5) | 1973 (med >300) | 1946 (med 214) | 1 |
| meas-area-count | measurement | T2 B51 | 1972 (med 152.5) | 2000 (med >300) | 2000 (med >300) | 1 |
| div-5d-1d-remainder | arithmetic | T2 B71 | 1984 (med >300) | 1995 (med >300) | 1987 (med >300) | 1 |
| num-compare-10000 | number | T2 B46 | 2000 (med >300) | 2000 (med >300) | 1987 (med >300) | 1 |
| add-missing-digit | arithmetic | T1 B2, T2 B54, T2 B55, T2 B63, T2 B64 | 1992 (med >300) | 2000 (med >300) | 2000 (med >300) | 1 |
| num-compare-100000 | number | T2 B60 | 2000 (med >300) | 2000 (med >300) | 1997 (med >300) | 1 |
| add-sub-find-error | arithmetic | T1 B2, T2 B54, T2 B55, T2 B63, T2 B64 | 1998 (med >300) | 2000 (med >300) | 2000 (med >300) | 2 |
| meas-len-order | measurement | T1 B7, T1 B30 | 1998 (med >300) | 1998 (med >300) | 1998 (med >300) | 1 |
| sub-4digit | arithmetic | T2 B55 | 1998 (med >300) | 2000 (med >300) | 1999 (med >300) | 1 |
| add-4digit | arithmetic | T2 B54 | 2000 (med >300) | 1999 (med >300) | 1999 (med >300) | 1 |
| add-sub-1000-wp | arithmetic | T1 B2 | 1999 (med >300) | 2000 (med >300) | 1999 (med >300) | 3 |
| add-sub-10000-wp | arithmetic | T2 B54, T2 B55 | 2000 (med >300) | 2000 (med >300) | 1999 (med >300) | 5 |
| add-5digit | arithmetic | T2 B63 | 2000 (med >300) | 2000 (med >300) | 2000 (med >300) | 1 |
| add-sub-1000-chain | arithmetic | T1 B2 | 2000 (med >300) | 2000 (med >300) | 2000 (med >300) | 1 |
| geo-shape-classify | geometry | T1 B7, T1 B19 | 2000 (med >300) | 2000 (med >300) | 2000 (med >300) | 4 |
| meas-area-equal | measurement | T2 B51 | 2000 (med >300) | 2000 (med >300) | 2000 (med >300) | 1 |
| sub-5digit | arithmetic | T2 B64 | 2000 (med >300) | 2000 (med >300) | 2000 (med >300) | 1 |
| table-fill-missing | data | T2 B73 | 2000 (med >300) | 2000 (med >300) | 2000 (med >300) | 1 |
| table-max-min | data | T2 B73 | 2000 (med >300) | 2000 (med >300) | 2000 (med >300) | 10 |
| table-read | data | T2 B73 | 2000 (med >300) | 2000 (med >300) | 2000 (med >300) | 5 |
| table-sums | data | T2 B73 | 2000 (med >300) | 2000 (med >300) | 2000 (med >300) | 5 |

## B. Lesson replays (10 replays each, worst first)

| lesson | items | in-run repeats | seen in previous 5 | seen % |
|---|---|---|---|---|
| B4 Bảng nhân 2, 5 và bảng chia 2, 5 | 60 | 0 | 46 | 76.7% |
| B5 Bảng nhân 3, bảng chia 3 | 60 | 0 | 43 | 71.7% |
| B9 Bảng nhân 6, bảng chia 6 | 60 | 0 | 43 | 71.7% |
| B10 Bảng nhân 7, bảng chia 7 | 60 | 0 | 43 | 71.7% |
| B11 Bảng nhân 8, bảng chia 8 | 60 | 0 | 43 | 71.7% |
| B12 Bảng nhân 9, bảng chia 9 | 60 | 0 | 43 | 71.7% |
| B6 Bảng nhân 4, bảng chia 4 | 60 | 0 | 42 | 70.0% |
| B41 Ôn tập nhân, chia phạm vi 100, 1 000 | 60 | 0 | 37 | 61.7% |
| B15 Luyện tập chung | 60 | 0 | 34 | 56.7% |
| B32 Mi-li-lít | 60 | 4 | 22 | 36.7% |
| B52 Diện tích hình chữ nhật, hình vuông | 60 | 0 | 22 | 36.7% |
| B47 Số La Mã | 60 | 5 | 18 | 30.0% |
| B68 Tiền Việt Nam | 60 | 0 | 18 | 30.0% |
| B16 Điểm ở giữa, trung điểm | 60 | 8 | 15 | 25.0% |
| B17 Hình tròn, tâm, bán kính, đường kính | 60 | 3 | 15 | 25.0% |
| B21 Khối lập phương, khối hộp chữ nhật | 60 | 2 | 14 | 23.3% |
| B36 Nhân số ba chữ số với số một chữ số | 60 | 1 | 14 | 23.3% |
| B69 Luyện tập chung | 60 | 0 | 14 | 23.3% |
| B56 Nhân số bốn chữ số với số một chữ số | 60 | 1 | 13 | 21.7% |
| B23 Nhân số hai chữ số với số một chữ số | 60 | 3 | 12 | 20.0% |
| B14 Một phần mấy | 60 | 0 | 12 | 20.0% |
| B26 Chia số hai chữ số cho số một chữ số | 60 | 0 | 12 | 20.0% |
| B78 Ôn tập nhân, chia trong phạm vi 100 000 | 60 | 0 | 12 | 20.0% |
| B8 Luyện tập chung | 60 | 0 | 11 | 18.3% |
| B40 Luyện tập chung | 60 | 0 | 10 | 16.7% |
| B18 Góc vuông, góc không vuông | 60 | 0 | 9 | 15.0% |
| B74 Khả năng xảy ra của một sự kiện | 60 | 2 | 8 | 13.3% |
| B58 Luyện tập chung | 60 | 0 | 8 | 13.3% |
| B44 Ôn tập chung | 60 | 0 | 7 | 11.7% |
| B37 Chia số ba chữ số cho số một chữ số | 60 | 0 | 6 | 10.0% |
| B76 Ôn tập các số đến 100 000 | 60 | 0 | 6 | 10.0% |
| B33 Nhiệt độ | 60 | 1 | 5 | 8.3% |
| B19 Các hình phẳng cơ bản | 60 | 0 | 5 | 8.3% |
| B22 Luyện tập chung | 60 | 0 | 5 | 8.3% |
| B57 Chia số bốn chữ số cho số một chữ số | 60 | 0 | 5 | 8.3% |
| B13 Tìm thành phần trong phép nhân, chia | 60 | 0 | 4 | 6.7% |
| B29 Luyện tập chung | 60 | 0 | 4 | 6.7% |
| B43 Ôn tập hình học và đo lường | 60 | 0 | 4 | 6.7% |
| B66 Xem đồng hồ, tháng – năm | 60 | 0 | 4 | 6.7% |
| B20 Thực hành vẽ hình | 60 | 0 | 3 | 5.0% |
| B30 Mi-li-mét | 60 | 0 | 3 | 5.0% |
| B49 Luyện tập chung | 60 | 0 | 3 | 5.0% |
| B50 Chu vi các hình phẳng | 60 | 0 | 3 | 5.0% |
| B53 Luyện tập chung | 60 | 0 | 3 | 5.0% |
| B67 Thực hành xem đồng hồ, xem lịch | 60 | 0 | 3 | 5.0% |
| B7 Ôn tập hình học và đo lường | 60 | 0 | 2 | 3.3% |
| B27 Giảm một số đi một số lần | 60 | 0 | 2 | 3.3% |
| B39 Số lớn gấp mấy lần số bé | 60 | 0 | 2 | 3.3% |
| B80 Ôn tập bảng số liệu, khả năng xảy ra | 60 | 0 | 2 | 3.3% |
| B81 Ôn tập chung | 60 | 0 | 2 | 3.3% |
| B31 Gam | 60 | 1 | 1 | 1.7% |
| B1 Ôn các số đến 1 000 | 60 | 0 | 1 | 1.7% |
| B3 Tìm thành phần trong phép cộng, trừ | 60 | 0 | 1 | 1.7% |
| B34 Thực hành với các đơn vị đo | 60 | 0 | 1 | 1.7% |
| B48 Làm tròn số đến hàng chục, hàng trăm | 60 | 0 | 1 | 1.7% |
| B70 Nhân số năm chữ số với số một chữ số | 60 | 0 | 1 | 1.7% |
| B75 Thực hành thu thập, đọc bảng số liệu | 60 | 0 | 1 | 1.7% |
| B79 Ôn tập hình học và đo lường | 60 | 0 | 1 | 1.7% |
| B72 Luyện tập chung | 60 | 1 | 0 | 0.0% |
| B2 Cộng, trừ trong phạm vi 1 000 | 60 | 0 | 0 | 0.0% |
| B24 Gấp một số lên một số lần | 60 | 0 | 0 | 0.0% |
| B25 Phép chia hết, phép chia có dư | 60 | 0 | 0 | 0.0% |
| B28 Bài toán giải bằng hai bước tính | 60 | 0 | 0 | 0.0% |
| B35 Luyện tập chung | 60 | 0 | 0 | 0.0% |
| B38 Biểu thức số | 60 | 0 | 0 | 0.0% |
| B42 Ôn tập biểu thức số | 60 | 0 | 0 | 0.0% |
| B45 Các số có bốn chữ số, số 10 000 | 60 | 0 | 0 | 0.0% |
| B46 So sánh các số trong phạm vi 10 000 | 60 | 0 | 0 | 0.0% |
| B51 Diện tích, xăng-ti-mét vuông | 60 | 0 | 0 | 0.0% |
| B54 Phép cộng trong phạm vi 10 000 | 60 | 0 | 0 | 0.0% |
| B55 Phép trừ trong phạm vi 10 000 | 60 | 0 | 0 | 0.0% |
| B59 Các số có năm chữ số, số 100 000 | 60 | 0 | 0 | 0.0% |
| B60 So sánh các số trong phạm vi 100 000 | 60 | 0 | 0 | 0.0% |
| B61 Làm tròn đến hàng nghìn, chục nghìn | 60 | 0 | 0 | 0.0% |
| B62 Luyện tập chung | 60 | 0 | 0 | 0.0% |
| B63 Phép cộng trong phạm vi 100 000 | 60 | 0 | 0 | 0.0% |
| B64 Phép trừ trong phạm vi 100 000 | 60 | 0 | 0 | 0.0% |
| B65 Luyện tập chung | 60 | 0 | 0 | 0.0% |
| B71 Chia số năm chữ số cho số một chữ số | 60 | 0 | 0 | 0.0% |
| B73 Thu thập số liệu, bảng số liệu | 60 | 0 | 0 | 0.0% |
| B77 Ôn tập cộng, trừ trong phạm vi 100 000 | 60 | 0 | 0 | 0.0% |

## C. Daily (30 days)

| run | items | in-run repeats | seen in previous 5 | seen % |
|---|---|---|---|---|
| daily (30 days) | 300 | 0 | 5 | 1.7% |

## D. Level reasoning rounds (50 rounds each)

| level | items | in-run repeats | seen in previous 5 | seen % |
|---|---|---|---|---|
| field | 50 | 0 | 0 | 0.0% |
| forest | 50 | 0 | 0 | 0.0% |
| city | 50 | 0 | 1 | 2.0% |
| tower | 50 | 0 | 0 | 0.0% |

## Top 20 repeaters (lesson replays, signature + count)

| signature | count |
|---|---|
| `div:49/7` | 17 |
| `mul:6x6` | 17 |
| `div:42/6` | 15 |
| `mul:6x7` | 15 |
| `div:12/6` | 14 |
| `div:14/7` | 13 |
| `div:56/8` | 13 |
| `mul:6x9` | 13 |
| `mul:2x6` | 12 |
| `div:16/8` | 10 |
| `div:18/9` | 10 |
| `div:21/3` | 10 |
| `div:24/3` | 10 |
| `div:25/5` | 10 |
| `div:28/4` | 10 |
| `div:6/3` | 10 |
| `div:63/9` | 10 |
| `div:8/4` | 10 |
| `mul:3x6` | 10 |
| `mul:3x7` | 10 |
