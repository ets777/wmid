<?php
require_once('./lib/init.php');
require_once('./lib/common.php');
require_once('./lib/db.php');

$data = file_get_contents('php://input');
$data = json_decode($data);

if (check_var($data->products)) {
    foreach ($data->products as $product) {
        if (isset($product->id)) {
            $result = $mysqli->query('INSERT INTO meals 
            (
                id, 
                date,
                meal_weight,
                meal_type_id,
                product_id
            ) VALUES (
                NULL, 
                "' . $data->date . '", 
                ' . (int)$product->weight . ', 
                ' . (int)$data->mealTypeId . ', 
                ' . (int)$product->id . '
            )');
        } else {

            $result = $mysqli->query('INSERT INTO products 
            (
                id, 
                name,
                calories
            ) VALUES (
                NULL, 
                "' . addslashes($product->name) . '",  
                ' . (int)$product->calories . '
            )');

            $new_product_id = $mysqli->insert_id;

            $result = $mysqli->query('INSERT INTO meals 
            (
                id, 
                date,
                meal_weight,
                meal_type_id,
                product_id
            ) VALUES (
                NULL, 
                "' . $data->date . '", 
                ' . (int)$product->weight . ', 
                ' . (int)$data->mealTypeId . ', 
                ' . (int)$new_product_id . '
            )');

        }
    }
}


echo json_encode($result);
