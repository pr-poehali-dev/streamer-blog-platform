'''
Business: Управление участием пользователей в розыгрышах
Args: event - dict с httpMethod, body, headers
      context - объект с атрибутами request_id, function_name
Returns: HTTP ответ со списком розыгрышей или статусом участия
'''

import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Token, X-Vk-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    if method == 'GET':
        headers = event.get('headers', {})
        vk_id_str = headers.get('X-Vk-Id') or headers.get('x-vk-id')
        vk_id = int(vk_id_str) if vk_id_str else None
        
        cur.execute(
            "SELECT id, title, prize, end_date::text, is_active FROM giveaways WHERE is_active = true ORDER BY end_date"
        )
        giveaways = cur.fetchall()
        
        result = []
        for giveaway in giveaways:
            giveaway_id, title, prize, end_date, is_active = giveaway
            
            cur.execute(
                "SELECT COUNT(*) FROM giveaway_participants WHERE giveaway_id = %s",
                (giveaway_id,)
            )
            participants_count = cur.fetchone()[0]
            
            is_participating = False
            if vk_id:
                cur.execute(
                    "SELECT u.id FROM users u WHERE u.vk_id = %s",
                    (vk_id,)
                )
                user_row = cur.fetchone()
                if user_row:
                    user_id = user_row[0]
                    cur.execute(
                        "SELECT COUNT(*) FROM giveaway_participants WHERE giveaway_id = %s AND user_id = %s",
                        (giveaway_id, user_id)
                    )
                    is_participating = cur.fetchone()[0] > 0
            
            result.append({
                'id': giveaway_id,
                'title': title,
                'prize': prize,
                'endDate': end_date,
                'participants': participants_count,
                'isParticipating': is_participating
            })
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'giveaways': result}),
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        giveaway_id = body_data.get('giveaway_id')
        vk_id = body_data.get('vk_id')
        
        if not giveaway_id or not vk_id:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'giveaway_id and vk_id required'}),
                'isBase64Encoded': False
            }
        
        cur.execute("SELECT id FROM users WHERE vk_id = %s", (vk_id,))
        user_row = cur.fetchone()
        
        if not user_row:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'User not found'}),
                'isBase64Encoded': False
            }
        
        user_id = user_row[0]
        
        cur.execute(
            "SELECT COUNT(*) FROM giveaway_participants WHERE giveaway_id = %s AND user_id = %s",
            (giveaway_id, user_id)
        )
        already_participating = cur.fetchone()[0] > 0
        
        if already_participating:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Already participating'}),
                'isBase64Encoded': False
            }
        
        cur.execute(
            "INSERT INTO giveaway_participants (giveaway_id, user_id) VALUES (%s, %s)",
            (giveaway_id, user_id)
        )
        conn.commit()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'success': True, 'message': 'Successfully joined giveaway'}),
            'isBase64Encoded': False
        }
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
