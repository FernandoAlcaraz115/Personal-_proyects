comportamientoLista :: [Float] -> String

comportamientoLista [] = "LISTA VACIA"

comportamientoLista [x] = "LISTA CON UN SOLO ELEMENTO: " ++ show x

comportamientoLista lista
    | rango < 100 = "RANGO: " ++ show rango ++ " BAJO"
    | rango < 500 = "RANGO: " ++ show rango ++ " NORMAL"
    | otherwise = "RANGO: " ++ show rango ++ " ALTO"
    where
        rango = maximum lista - minimum lista

