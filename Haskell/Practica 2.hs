combinaciones :: Int -> Int -> String -> [(Int, Int, Char)]
combinaciones limite serie mensaje =
    [ (i, s, c)
    | i <- [1..limite]
    , s <- [serie, 2 * serie .. 2 * limite]
    , c <- mensaje
    , c >= 'a' && c <= 'z'
    ]