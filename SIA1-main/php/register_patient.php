<?php
header('Content-Type: application/json');
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!$data) { echo json_encode(['success'=>false,'message'=>'Invalid JSON']); exit; }
if (empty($data['patient_name'])) { echo json_encode(['success'=>false,'message'=>'Missing patient_name']); exit; }
$dir = __DIR__ . '/data'; if (!is_dir($dir)) mkdir($dir,0755,true);
$file = $dir . '/patients.json'; $all = [];
if (file_exists($file)) { $txt = file_get_contents($file); $all = json_decode($txt, true) ?: []; }
$patient_id = 'PAT-' . time();
$record = [ 'patient_id'=>$patient_id, 'patient_name'=>$data['patient_name'], 'dob'=>$data['dob'] ?? '', 'gender'=>$data['gender'] ?? '', 'contact'=>$data['contact'] ?? '', 'address'=>$data['address'] ?? '' ];
$all[] = $record; file_put_contents($file, json_encode($all, JSON_PRETTY_PRINT));
echo json_encode(['success'=>true,'record'=>$record]);
