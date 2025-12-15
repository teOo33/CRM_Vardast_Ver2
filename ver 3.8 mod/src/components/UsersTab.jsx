import React, { useState } from 'react';
import { User, Search, Edit } from 'lucide-react';
import UserAvatar from './UserAvatar';

const UsersTab = ({ users, navigateToProfile }) => {
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) || 
    (u.phone_number && u.phone_number.includes(search))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white/80 backdrop-blur p-4 rounded-2xl shadow-sm border border-white">
        <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2"><User size={24} className="text-blue-500"/> لیست کاربران</h2>
        <div className="relative">
            <input 
                type="text" 
                placeholder="جستجو..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="pl-8 pr-4 py-2 rounded-xl border text-sm outline-none focus:border-blue-500"
            />
            <Search size={16} className="absolute left-2 top-2.5 text-gray-400"/>
        </div>
      </div>
      <div className="bg-white rounded-2xl border overflow-hidden overflow-x-auto">
        <table className="w-full text-sm text-right whitespace-nowrap">
            <thead className="bg-slate-50 text-gray-500 border-b">
                <tr>
                    <th className="p-4">کاربر</th>
                    <th className="p-4">شماره تماس</th>
                    <th className="p-4">اینستاگرام</th>
                    <th className="p-4">تلگرام</th>
                    <th className="p-4">وبسایت</th>
                    <th className="p-4"></th>
                </tr>
            </thead>
            <tbody>
                {filteredUsers.map((user, idx) => (
                    <tr key={idx} className="border-b last:border-0 hover:bg-slate-50">
                        <td className="p-4 font-bold cursor-pointer hover:text-blue-600 flex items-center gap-2" onClick={() => navigateToProfile(user.username)}>
                            <UserAvatar name={user.username} size="sm"/>
                            {user.username}
                        </td>
                        <td className="p-4 dir-ltr text-right">{user.phone_number || '-'}</td>
                        <td className="p-4 dir-ltr text-right">{user.instagram_username || '-'}</td>
                        <td className="p-4 dir-ltr text-right">{user.telegram_id || '-'}</td>
                        <td className="p-4 dir-ltr text-right">{user.website || '-'}</td>
                        <td className="p-4">
                            <button onClick={() => navigateToProfile(user.username)} className="text-gray-400 hover:text-blue-600" title="مشاهده پروفایل">
                                <Edit size={16}/>
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTab;
