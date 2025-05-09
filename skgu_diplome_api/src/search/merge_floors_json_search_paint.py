import heapq
import json
import math
import os
from typing import List, Dict, Any

from PIL import Image, ImageDraw

DEBUG_SHOW_NODES = True


def load_graph_data_from_file(file_path: str) -> Dict[str, Any]:
    print(file_path)
    """Загружает данные из JSON-файла и возвращает их."""
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data


def load_graph_data(file_paths: List[str]) -> Dict[str, Any]:
    """Загружает данные графа из списка JSON-файлов и объединяет их.
    Возвращает словарь, содержащий узлы, ребра, пути к изображениям и соответствия этажей.
    """
    all_nodes = {}
    all_edges = []
    image_paths = {}
    floor_mapping = {}

    for file_path in file_paths:
        data = load_graph_data_from_file(file_path)
        image_path = data.get('image_path')  # Получаем путь к изображению
        building_number = data.get('building_number', None)  # Получаем номер здания
        if not image_path:
            print(f"Предупреждение: image_path отсутствует в файле {file_path}")
            continue

        # Обновляем все узлы с данными из текущего файла
        nodes = data.get('nodes', {})
        for node_id, node_data in nodes.items():
            all_nodes[node_id] = node_data  # Сохраняем все данные узла

            # floor_mapping[node_id] = file_path # Сопоставляем node_id с file_path (для определения этажа)
            floor_mapping[node_id] = image_path  # Сопоставляем node_id с путем к изображению
            # Добавим номер здания к узлу.
            node_data['building_number'] = building_number

        # Добавляем все ребра из текущего файла
        edges = data.get('edges', [])
        all_edges.extend(edges)

        image_paths[image_path] = image_path  # Сохраняем соответствие между путем к изображению и самим собой

    return {
        'nodes': all_nodes,
        'edges': all_edges,
        'image_paths': image_paths,
        'floor_mapping': floor_mapping
    }


def build_graph(nodes, edges):
    """Строит граф на основе узлов и ребер."""
    graph = {node: [] for node in nodes}
    for node1, node2, weight in edges:
        graph[node1].append((node2, weight))
        graph[node2].append((node1, weight))
    return graph


def dijkstra_path(graph, start, goal):
    """Алгоритм Дейкстры."""
    if start not in graph or goal not in graph:
        return None
    queue = [(0, start, [start])]
    seen = {start: 0}
    while queue:
        cost, node, path = heapq.heappop(queue)
        if node == goal:
            return path
        for neighbor, weight in graph[node]:
            new_cost = cost + weight
            if neighbor not in seen or new_cost < seen[neighbor]:
                seen[neighbor] = new_cost
                heapq.heappush(queue, (new_cost, neighbor, path + [neighbor]))
    return None


def draw_path(image_path, coords_dict, path, out_path):
    """Рисует маршрут без переходов между этажами."""
    img = Image.open(image_path)
    draw = ImageDraw.Draw(img)

    for i in range(len(path) - 1):
        x1, y1, _ = coords_dict[path[i]]
        x2, y2, _ = coords_dict[path[i + 1]]
        draw.line((x1, y1, x2, y2), fill='red', width=3)

    if DEBUG_SHOW_NODES:
        for node, (x, y, _) in coords_dict.items():
            draw.ellipse((x - 4, y - 4, x + 4, y + 4), fill='blue')
            draw.text((x + 5, y - 5), node, fill='blue')

    img.save(out_path)


def draw_path_with_arrows(image_path, coords_dict, path, out_path, arrow_length=10, arrow_angle=30):
    """Рисует маршрут с стрелками."""
    img = Image.open(image_path)
    draw = ImageDraw.Draw(img)

    # Отбираем только те точки, для которых есть координаты на данном этаже
    path_on_this_floor = [p for p in path if p in coords_dict]

    for i in range(len(path_on_this_floor) - 1):
        node_data = coords_dict[path_on_this_floor[i]]  # Получаем словарь для узла
        x1 = node_data['coords'][0]  # Извлекаем x координату из словаря
        y1 = node_data['coords'][1]  # Извлекаем y координату из словаря
        # type = node_data['type'] # Если вам нужен type узла, то его можно получить так

        node_data_next = coords_dict[path_on_this_floor[i + 1]]  # Для следующей точки
        x2 = node_data_next['coords'][0]
        y2 = node_data_next['coords'][1]

        # Рисуем основной сегмент пути (красная линия)
        draw.line((x1, y1, x2, y2), fill='red', width=3)

        # Вычисляем угол направления линии
        angle = math.atan2(y2 - y1, x2 - x1)
        rad_arrow_angle = math.radians(arrow_angle)

        # Вычисляем координаты для двух линий стрелки (от конца отрезка)
        arrow_point1 = (
            x2 - arrow_length * math.cos(angle - rad_arrow_angle),
            y2 - arrow_length * math.sin(angle - rad_arrow_angle)
        )
        arrow_point2 = (
            x2 - arrow_length * math.cos(angle + rad_arrow_angle),
            y2 - arrow_length * math.sin(angle + rad_arrow_angle)
        )

        # Рисуем линии стрелки
        draw.line((x2, y2, arrow_point1[0], arrow_point1[1]), fill='red', width=3)
        draw.line((x2, y2, arrow_point2[0], arrow_point2[1]), fill='red', width=3)

    # Если включён режим отладки, рисуем узлы и их подписи
    if DEBUG_SHOW_NODES:
        for node, node_data in coords_dict.items():  # Получаем координаты и тип узла
            x = node_data['coords'][0]
            y = node_data['coords'][1]
            r = 4  # радиус кружка
            draw.ellipse((x - r, y - r, x + r, y + r), fill='blue')
            draw.text((x + 5, y - 5), node, fill='blue')

    img.save(out_path)


def process_route(json_files, start_point, target_point, output_folder="path_images"):
    """
    Вычисляет путь и генерирует изображения маршрута, не рисуя переходы между этажами.
    """
    os.makedirs(output_folder, exist_ok=True)
    graph_data = load_graph_data(json_files)
    nodes = graph_data['nodes']
    edges = graph_data['edges']
    image_paths = graph_data['image_paths']
    floor_mapping = graph_data['floor_mapping']
    graph = build_graph(nodes, edges)

    path = dijkstra_path(graph, start_point, target_point)
    print("Путь:", path)
    if not path:
        print("Путь не найден.")
        return

    # Разделяем путь по этажам
    floor_paths = {}
    prev_floor = None

    for node in path:
        floor = floor_mapping[node]
        if floor not in floor_paths:
            floor_paths[floor] = []
        if prev_floor != floor:
            floor_paths[floor].append(node)  # Начало нового отрезка
        else:
            floor_paths[floor].append(node)  # Продолжение пути на том же этаже
        prev_floor = floor

    # Рисуем пути на каждом этаже
    for floor, floor_path in floor_paths.items():
        image_path = image_paths[floor]
        image_filename = os.path.basename(image_path)
        out_path = os.path.join(output_folder, f"{floor}_path.png")

        # Создаем словарь узлов только для текущего этажа
        floor_nodes = {node: nodes[node] for node in nodes if floor_mapping[node] == floor}

        draw_path_with_arrows(image_path, floor_nodes, floor_path, out_path)


# if __name__ == '__main__':
#     json_files = [
#         r'E:\PycharmProjects\skgu_diplome_api\src\search\floor1_building1.json',
#         r'E:\PycharmProjects\skgu_diplome_api\src\search\floor2_building1.json'
#     ]
#     start_point = '1_entrance'
#     target_point = '2_office_222'
#     process_route(json_files, start_point, target_point)
